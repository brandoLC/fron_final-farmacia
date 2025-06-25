import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces para productos
export interface Product {
  tenant_id: string;
  codigo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  stock_disponible: number;
  requiere_receta: boolean;
  laboratorio: string;
  presentacion: string;
  imagen_url: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  fecha_actualizacion: string; // Alias para compatibilidad
  activo: boolean;
}

export interface CreateProductRequest {
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  stock_disponible: number;
  requiere_receta: boolean;
  laboratorio: string;
  presentacion: string;
  imagen_url: string;
}

export interface UpdateProductRequest {
  nombre?: string;
  precio?: number;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  stock_disponible?: number;
  requiere_receta?: boolean;
  laboratorio?: string;
  presentacion?: string;
  imagen_url?: string;
  activo?: boolean;
}

export interface ProductListResponse {
  productos: Product[];
  count: number;
  nextKey?: string;
  hasMore: boolean;
}

export interface ProductResponse {
  message: string;
  producto: Product;
}

export interface CategoriesResponse {
  categorias: Record<string, string[]>;
  total_categorias: number;
}

export interface SubcategoriesResponse {
  categoria: string;
  subcategorias: string[];
  total: number;
}

export interface CategoryWithSubcategories {
  id: string;
  nombre: string;
  subcategorias: Subcategory[];
}

export interface Subcategory {
  id: string;
  nombre: string;
}

export interface FilterProductsParams {
  categoria?: string;
  subcategoria?: string;
  laboratorio?: string;
  requiere_receta?: boolean;
  precio_min?: number;
  precio_max?: number;
  search?: string;
  limit?: number;
  lastKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // API Configuration
  private readonly API_URL =
    'https://6b7ua2wowe.execute-api.us-east-1.amazonaws.com/dev';

  // Signals para estado
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isLoadingCategories = signal<boolean>(false);
  private readonly _products = signal<Product[]>([]);
  private readonly _categories = signal<Record<string, string[]>>({});
  private readonly _structuredCategories = signal<CategoryWithSubcategories[]>(
    []
  );

  // Computed signals públicos
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoadingCategories = this._isLoadingCategories.asReadonly();
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly structuredCategories = this._structuredCategories.asReadonly();

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
   * Lista productos con paginación
   */
  listarProductos(
    limit: number = 20,
    lastKey?: string
  ): Observable<ProductListResponse> {
    this._isLoading.set(true);

    let url = `${this.API_URL}/productos/listar?limit=${limit}`;
    if (lastKey) {
      url += `&lastKey=${encodeURIComponent(lastKey)}`;
    }

    return this.http
      .get<ProductListResponse>(url, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          // Actualizar signal con productos
          if (!lastKey) {
            // Primera página - reemplazar
            this._products.set(response.productos);
          } else {
            // Páginas siguientes - agregar
            this._products.update((current) => [
              ...current,
              ...response.productos,
            ]);
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
   * Crea un nuevo producto
   */
  crearProducto(
    productData: CreateProductRequest
  ): Observable<ProductResponse> {
    this._isLoading.set(true);

    return this.http
      .post<ProductResponse>(`${this.API_URL}/productos/crear`, productData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          // Agregar producto al signal
          this._products.update((current) => [response.producto, ...current]);
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Busca un producto por código
   */
  buscarProducto(codigo: string): Observable<Product> {
    this._isLoading.set(true);

    return this.http
      .get<{ producto: Product }>(
        `${this.API_URL}/productos/buscar/${codigo}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => response.producto),
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Modifica un producto existente
   */
  modificarProducto(
    codigo: string,
    productData: Partial<UpdateProductRequest>
  ): Observable<ProductResponse> {
    this._isLoading.set(true);

    return this.http
      .put<ProductResponse>(
        `${this.API_URL}/productos/modificar/${codigo}`,
        productData,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap((response) => {
          // Actualizar producto en el signal
          this._products.update((current) =>
            current.map((p) => (p.codigo === codigo ? response.producto : p))
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Elimina un producto
   */
  eliminarProducto(
    codigo: string
  ): Observable<{ message: string; producto_eliminado: Product }> {
    this._isLoading.set(true);

    return this.http
      .delete<{ message: string; producto_eliminado: Product }>(
        `${this.API_URL}/productos/eliminar/${codigo}`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap(() => {
          // Remover producto del signal
          this._products.update((current) =>
            current.filter((p) => p.codigo !== codigo)
          );
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Obtiene categorías disponibles
   */
  obtenerCategorias(): Observable<Record<string, string[]>> {
    return this.http
      .get<any>(`${this.API_URL}/productos/categorias`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          // La API devuelve el body como string, necesitamos parsearlo
          const parsedBody =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body || response;

          return parsedBody.categorias || {};
        }),
        tap((categorias) => this._categories.set(categorias)),
        catchError((error) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Obtiene subcategorías de una categoría específica
   */
  obtenerSubcategorias(categoria: string): Observable<string[]> {
    return this.http
      .get<any>(
        `${this.API_URL}/productos/categorias/${encodeURIComponent(
          categoria
        )}/subcategorias`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map((response) => {
          // La API devuelve el body como string, necesitamos parsearlo
          const parsedBody =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body || response;

          return parsedBody.subcategorias || [];
        }),
        catchError((error) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Filtra productos con múltiples criterios
   */
  filtrarProductos(
    params: FilterProductsParams
  ): Observable<ProductListResponse> {
    this._isLoading.set(true);

    // Construir query string
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.API_URL}/productos/filtrar?${queryParams.toString()}`;

    return this.http
      .get<ProductListResponse>(url, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          // Si no hay lastKey, es una nueva búsqueda
          if (!params.lastKey) {
            this._products.set(response.productos);
          } else {
            // Agregar más resultados
            this._products.update((current) => [
              ...current,
              ...response.productos,
            ]);
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
   * Limpia el estado de productos
   */
  limpiarProductos(): void {
    this._products.set([]);
  }

  /**
   * Recarga la lista de productos
   */
  recargarProductos(): Observable<ProductListResponse> {
    this.limpiarProductos();
    return this.listarProductos();
  }

  /**
   * Obtiene un producto por código (alias para buscarProducto)
   */
  obtenerProductoPorCodigo(codigo: string): Observable<Product> {
    return this.buscarProducto(codigo).pipe(
      map((product) => ({
        ...product,
        fecha_actualizacion: product.fecha_modificacion, // Alias para compatibilidad
      }))
    );
  }

  /**
   * Actualiza un producto existente (alias para modificarProducto)
   */
  actualizarProducto(
    codigo: string,
    productData: UpdateProductRequest
  ): Observable<ProductResponse> {
    return this.modificarProducto(codigo, productData);
  }

  /**
   * Cambia el estado activo/inactivo de un producto
   */
  toggleProductStatus(codigo: string): Observable<ProductResponse> {
    this._isLoading.set(true);

    // Como no tenemos un endpoint específico de toggle, usamos modificar
    // Primero obtenemos el producto actual para conocer su estado
    return this.buscarProducto(codigo).pipe(
      switchMap((product: Product) => {
        const newStatus = !product.activo;
        return this.modificarProducto(codigo, { activo: newStatus });
      }),
      tap((response: ProductResponse) => {
        // Actualizar producto en el signal
        this._products.update((current) =>
          current.map((p) => (p.codigo === codigo ? response.producto : p))
        );
        this._isLoading.set(false);
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Carga las categorías y las estructura para el menú
   */
  loadCategories(): void {
    if (this._isLoadingCategories()) return; // Evitar múltiples cargas

    this._isLoadingCategories.set(true);
    this.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Convertir el formato de la API a estructura para el menú
        const structured = Object.entries(categorias).map(
          ([nombreCategoria, subcategorias]) => ({
            id: nombreCategoria.toLowerCase().replace(/\s+/g, '-'),
            nombre: nombreCategoria,
            subcategorias: subcategorias.map((sub, index) => ({
              id: `${nombreCategoria.toLowerCase().replace(/\s+/g, '-')}-${sub
                .toLowerCase()
                .replace(/\s+/g, '-')}`,
              nombre: sub,
            })),
          })
        );
        this._structuredCategories.set(structured);
        this._isLoadingCategories.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this._isLoadingCategories.set(false);
      },
    });
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): string {
    console.error('Product Service Error:', error);

    if (error.status === 401) {
      return 'No autorizado. Inicia sesión nuevamente.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error.status === 404) {
      return 'Producto no encontrado.';
    }

    if (error.status === 409) {
      return 'Ya existe un producto con ese código.';
    }

    if (error.status === 422) {
      return 'Datos inválidos. Verifica la información.';
    }

    if (error.status === 500) {
      return 'Error interno del servidor.';
    }

    if (error.status === 0) {
      return 'Error de conexión. Verifica tu internet.';
    }

    // Si hay un mensaje específico en el error
    if (error.error?.error) {
      return error.error.error;
    }

    return error.message || 'Error inesperado al procesar la solicitud.';
  }
}
