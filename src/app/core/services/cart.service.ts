import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Product } from './product.service';

// Interfaces para el carrito
export interface CartItem {
  producto: Product;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  envio: number;
  total: number;
}

// Interfaces para compras
export interface CompraProduct {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface CompraRequest {
  productos: CompraProduct[];
  metodo_pago: 'tarjeta' | 'efectivo' | 'transferencia' | 'paypal';
  direccion_entrega: string;
  observaciones?: string;
}

export interface CompraResponse {
  success: boolean;
  message: string;
  orden_id?: string;
  total?: number;
  fecha_compra?: string;
}

export interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // API Configuration
  private readonly API_URL =
    'https://2vb4fkgnri.execute-api.us-east-1.amazonaws.com/dev';

  // Signals para estado del carrito
  private readonly _items = signal<CartItem[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isVisible = signal<boolean>(false); // Para mostrar/ocultar carrito lateral

  // Computed signals públicos
  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isVisible = this._isVisible.asReadonly();

  // Computed values del carrito
  readonly totalItems = computed(() =>
    this._items().reduce((total, item) => total + item.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((total, item) => total + item.subtotal, 0)
  );

  readonly descuentos = computed(() => 0); // Por ahora sin descuentos
  readonly impuestos = computed(() => this.subtotal() * 0.18); // IGV 18%
  readonly envio = computed(() => (this.subtotal() > 50 ? 0 : 10)); // Envío gratis > S/50

  readonly total = computed(
    () => this.subtotal() + this.impuestos() + this.envio() - this.descuentos()
  );

  readonly cart = computed<Cart>(() => ({
    items: this._items(),
    total_items: this.totalItems(),
    subtotal: this.subtotal(),
    descuentos: this.descuentos(),
    impuestos: this.impuestos(),
    envio: this.envio(),
    total: this.total(),
  }));

  // Métodos de pago disponibles
  readonly metodosPago: MetodoPago[] = [
    {
      id: 'tarjeta',
      nombre: 'Tarjeta de Crédito/Débito',
      descripcion: 'Visa, Mastercard, American Express',
      icono: 'credit-card',
      activo: true,
    },
    {
      id: 'efectivo',
      nombre: 'Efectivo',
      descripcion: 'Pago contra entrega',
      icono: 'cash',
      activo: true,
    },
    {
      id: 'transferencia',
      nombre: 'Transferencia Bancaria',
      descripcion: 'BCP, BBVA, Scotiabank',
      icono: 'bank',
      activo: true,
    },
    {
      id: 'paypal',
      nombre: 'PayPal',
      descripcion: 'Pago seguro con PayPal',
      icono: 'paypal',
      activo: false, // Deshabilitado por ahora
    },
  ];

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Headers de autorización
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product, cantidad: number = 1): void {
    // Validar stock disponible
    if (product.stock_disponible < cantidad) {
      throw new Error(
        `Solo hay ${product.stock_disponible} unidades disponibles`
      );
    }

    const currentItems = this._items();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.producto.codigo === product.codigo
    );

    if (existingItemIndex >= 0) {
      // Producto ya existe, actualizar cantidad
      const existingItem = currentItems[existingItemIndex];
      const newCantidad = existingItem.cantidad + cantidad;

      // Validar stock total
      if (product.stock_disponible < newCantidad) {
        throw new Error(
          `Solo hay ${product.stock_disponible} unidades disponibles`
        );
      }

      this.updateQuantity(product.codigo, newCantidad);
    } else {
      // Nuevo producto
      const newItem: CartItem = {
        producto: product,
        cantidad: cantidad,
        precio_unitario: product.precio,
        subtotal: product.precio * cantidad,
      };

      this._items.update((items) => [...items, newItem]);
    }

    this.saveCartToStorage();
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(codigo: string, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.removeFromCart(codigo);
      return;
    }

    this._items.update((items) =>
      items.map((item) => {
        if (item.producto.codigo === codigo) {
          // Validar stock
          if (item.producto.stock_disponible < nuevaCantidad) {
            throw new Error(
              `Solo hay ${item.producto.stock_disponible} unidades disponibles`
            );
          }

          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: item.precio_unitario * nuevaCantidad,
          };
        }
        return item;
      })
    );

    this.saveCartToStorage();
  }

  /**
   * Eliminar producto del carrito
   */
  removeFromCart(codigo: string): void {
    this._items.update((items) =>
      items.filter((item) => item.producto.codigo !== codigo)
    );
    this.saveCartToStorage();
  }

  /**
   * Limpiar carrito
   */
  clearCart(): void {
    this._items.set([]);
    this.saveCartToStorage();
  }

  /**
   * Mostrar/ocultar carrito lateral
   */
  toggleCart(): void {
    this._isVisible.update((visible) => !visible);
  }

  showCart(): void {
    this._isVisible.set(true);
  }

  hideCart(): void {
    this._isVisible.set(false);
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isInCart(codigo: string): boolean {
    return this._items().some((item) => item.producto.codigo === codigo);
  }

  /**
   * Obtener cantidad de un producto en el carrito
   */
  getQuantityInCart(codigo: string): number {
    const item = this._items().find((item) => item.producto.codigo === codigo);
    return item ? item.cantidad : 0;
  }

  /**
   * Registrar compra
   */
  registrarCompra(
    metodoPago: string,
    direccionEntrega: string,
    observaciones?: string
  ): Observable<CompraResponse> {
    const items = this._items();

    if (items.length === 0) {
      return throwError(() => new Error('El carrito está vacío'));
    }

    this._isLoading.set(true);

    const compraRequest: CompraRequest = {
      productos: items.map((item) => ({
        codigo: item.producto.codigo,
        nombre: item.producto.nombre,
        precio: item.precio_unitario,
        cantidad: item.cantidad,
      })),
      metodo_pago: metodoPago as any,
      direccion_entrega: direccionEntrega,
      observaciones: observaciones,
    };

    return this.http
      .post<any>(`${this.API_URL}/compras/registrar`, compraRequest, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          // Parsear respuesta si es necesario
          const parsedBody =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body || response;

          return {
            success: true,
            message: parsedBody.message || 'Compra registrada exitosamente',
            orden_id: parsedBody.orden_id,
            total: parsedBody.total,
            fecha_compra: parsedBody.fecha_compra,
          } as CompraResponse;
        }),
        tap((response) => {
          if (response.success) {
            // Limpiar carrito después de compra exitosa
            this.clearCart();
          }
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(): void {
    try {
      const cartData = {
        items: this._items(),
        timestamp: new Date().getTime(),
      };
      localStorage.setItem('farmacia_cart', JSON.stringify(cartData));
    } catch (error) {
      console.warn('No se pudo guardar el carrito en localStorage:', error);
    }
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem('farmacia_cart');
      if (cartData) {
        const parsed = JSON.parse(cartData);

        // Verificar que los datos no sean muy antiguos (24 horas)
        const now = new Date().getTime();
        const dayInMs = 24 * 60 * 60 * 1000;

        if (parsed.timestamp && now - parsed.timestamp < dayInMs) {
          this._items.set(parsed.items || []);
        } else {
          // Datos muy antiguos, limpiar
          localStorage.removeItem('farmacia_cart');
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar el carrito desde localStorage:', error);
      localStorage.removeItem('farmacia_cart');
    }
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): string {
    console.error('Cart Service Error:', error);

    if (error.status === 401) {
      return 'No autorizado. Inicia sesión para realizar la compra.';
    }

    if (error.status === 400) {
      return 'Datos de compra inválidos. Verifica la información.';
    }

    if (error.status === 409) {
      return 'Algunos productos no tienen stock suficiente.';
    }

    if (error.status === 500) {
      return 'Error interno del servidor.';
    }

    if (error.status === 0) {
      return 'Error de conexión. Verifica tu internet.';
    }

    // Si hay un mensaje específico en el error
    if (error.error?.message) {
      return error.error.message;
    }

    return error.message || 'Error inesperado al procesar la compra.';
  }
}
