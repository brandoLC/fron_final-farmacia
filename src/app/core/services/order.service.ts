import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces para las compras/pedidos
export interface OrderProduct {
  codigo: string;
  precio: number;
  cantidad: number;
  nombre: string;
  subtotal: number;
}

export interface Order {
  metodo_pago: string;
  tenant_id: string;
  productos: OrderProduct[];
  total_productos: number;
  email_usuario: string;
  nombre_usuario: string;
  observaciones?: string;
  total_monto: number;
  fecha_compra: string;
  direccion_entrega: string;
  codigo_compra: string;
  estado: 'completada' | 'pendiente' | 'cancelada' | 'en_proceso';
}

export interface OrdersListResponse {
  compras: Order[];
  count: number;
  hasMore: boolean;
  nextKey?: string;
}

export interface OrderDetailResponse {
  compra: Order;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // API Configuration
  private readonly API_URL =
    'https://2vb4fkgnri.execute-api.us-east-1.amazonaws.com/dev';

  // Signals para estado
  private readonly _isLoading = signal<boolean>(false);
  private readonly _orders = signal<Order[]>([]);

  // Computed signals públicos
  readonly isLoading = this._isLoading.asReadonly();
  readonly orders = this._orders.asReadonly();

  /**
   * Obtiene headers con autorización
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /**
   * Lista las compras/pedidos del usuario
   */
  listarCompras(
    limit: number = 20,
    nextKey?: string
  ): Observable<OrdersListResponse> {
    this._isLoading.set(true);

    let url = `${this.API_URL}/compras/listar?limit=${limit}`;
    if (nextKey) {
      url += `&nextKey=${encodeURIComponent(nextKey)}`;
    }

    return this.http
      .get<any>(url, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          // Parsear el body si es un string JSON
          const parsedBody =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body || response;

          return {
            compras: parsedBody.compras || [],
            count: parsedBody.count || 0,
            hasMore: parsedBody.hasMore || false,
            nextKey: parsedBody.nextKey || undefined,
          } as OrdersListResponse;
        }),
        tap((response) => {
          // Actualizar signal con pedidos
          if (!nextKey) {
            // Primera página - reemplazar
            this._orders.set(response.compras);
          } else {
            // Páginas siguientes - agregar
            this._orders.update((current) => [...current, ...response.compras]);
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
   * Obtiene el detalle de una compra específica
   */
  obtenerCompra(codigoCompra: string): Observable<Order> {
    this._isLoading.set(true);

    return this.http
      .get<any>(`${this.API_URL}/compras/${codigoCompra}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          // Parsear el body si es un string JSON
          const parsedBody =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body || response;

          return parsedBody.compra;
        }),
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Limpia el estado de pedidos
   */
  limpiarPedidos(): void {
    this._orders.set([]);
  }

  /**
   * Recarga la lista de pedidos
   */
  recargarPedidos(): Observable<OrdersListResponse> {
    this.limpiarPedidos();
    return this.listarCompras();
  }

  /**
   * Obtiene el estado badge color para mostrar en la UI
   */
  getEstadoBadgeColor(estado: Order['estado']): string {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtiene el texto legible del estado
   */
  getEstadoText(estado: Order['estado']): string {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En proceso';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Formatea la fecha de compra
   */
  formatearFecha(fechaCompra: string): string {
    try {
      const fecha = new Date(fechaCompra);
      return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return fechaCompra;
    }
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): string {
    console.error('Order Service Error:', error);

    if (error.status === 401) {
      return 'No autorizado. Inicia sesión para ver tus pedidos.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para ver esta información.';
    }

    if (error.status === 404) {
      return 'Pedido no encontrado.';
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

    return error.message || 'Error inesperado al cargar los pedidos.';
  }
}
