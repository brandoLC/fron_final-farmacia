import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ProductService,
  Product,
  SearchResponse,
} from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        @if (isLoading()) {
        <!-- Loading State -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="animate-pulse">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="bg-gray-200 aspect-square rounded-xl"></div>
              <div class="space-y-4">
                <div class="h-8 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-6 bg-gray-200 rounded w-1/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded"></div>
                  <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        } @else if (product()) {
        <!-- Product Detail -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- Imagen del producto -->
            <div
              class="bg-gray-50 p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px]"
            >
              <div class="w-full max-w-md">
                <img
                  [src]="product()!.imagen_url"
                  [alt]="product()!.nombre"
                  class="w-full h-auto object-contain rounded-lg shadow-lg"
                  (error)="onImageError($event)"
                />
              </div>
            </div>

            <!-- Información del producto -->
            <div class="p-8 lg:p-12 space-y-6">
              <!-- Breadcrumb -->
              <nav class="text-sm text-gray-500 mb-4">
                <a [routerLink]="['/']" class="hover:text-green-600">Inicio</a>
                <span class="mx-2">›</span>
                <span class="text-green-600">{{ product()!.categoria }}</span>
                @if (product()!.subcategoria) {
                <span class="mx-2">›</span>
                <span class="text-green-600">{{
                  product()!.subcategoria
                }}</span>
                }
              </nav>

              <!-- Nombre y precio -->
              <div class="space-y-4">
                <h1
                  class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
                >
                  {{ product()!.nombre }}
                </h1>

                <div class="flex items-center space-x-4">
                  <span class="text-4xl font-bold text-green-600">
                    S/ {{ product()!.precio | number : '1.2-2' }}
                  </span>
                  @if (product()!.stock_disponible > 0) {
                  <span
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    En stock ({{ product()!.stock_disponible }})
                  </span>
                  } @else {
                  <span
                    class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    Sin stock
                  </span>
                  }
                </div>
              </div>

              <!-- Información adicional -->
              <div class="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
                <div>
                  <span class="text-sm text-gray-500">Laboratorio</span>
                  <p class="font-semibold text-gray-900">
                    {{ product()!.laboratorio }}
                  </p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Presentación</span>
                  <p class="font-semibold text-gray-900">
                    {{ product()!.presentacion }}
                  </p>
                </div>
                @if (product()!.requiere_receta) {
                <div class="col-span-2">
                  <div
                    class="bg-amber-50 border border-amber-200 rounded-lg p-4"
                  >
                    <div class="flex items-center">
                      <svg
                        class="w-5 h-5 text-amber-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="text-amber-800 font-semibold"
                        >Requiere receta médica</span
                      >
                    </div>
                  </div>
                </div>
                }
              </div>

              <!-- Descripción -->
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  Descripción
                </h3>
                <p class="text-gray-600 leading-relaxed">
                  {{ product()!.descripcion }}
                </p>
              </div>

              <!-- Acciones -->
              <div class="border-t border-gray-200 pt-6 space-y-4">
                @if (product()!.stock_disponible > 0) {
                <button
                  (click)="addToCart(product()!)"
                  [disabled]="cartService.isLoading()"
                  class="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  @if (cartService.isLoading()) {
                  <div
                    class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  ></div>
                  <span>Agregando...</span>
                  } @else {
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19"
                    />
                  </svg>
                  <span>Agregar al carrito</span>
                  }
                </button>
                } @else {
                <button
                  disabled
                  class="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-xl font-semibold text-lg cursor-not-allowed"
                >
                  Sin stock disponible
                </button>
                }

                <button
                  class="w-full border-2 border-green-600 text-green-600 py-3 px-6 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-200"
                >
                  Consultar disponibilidad
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos relacionados -->
        @if (relatedProducts().length > 0) {
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">
            <div class="flex items-center space-x-3">
              <div class="w-1 h-8 bg-green-500 rounded-full"></div>
              <span>Productos relacionados</span>
            </div>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (relatedProduct of relatedProducts(); track
            relatedProduct.codigo) {
            <div
              class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-green-200"
            >
              <div
                class="aspect-square bg-gray-50 p-4 relative overflow-hidden"
              >
                <img
                  [src]="relatedProduct.imagen_url"
                  [alt]="relatedProduct.nombre"
                  class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  (error)="onImageError($event)"
                />
                @if (relatedProduct.stock_disponible <= 0) {
                <div
                  class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
                >
                  <span
                    class="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm"
                    >Sin stock</span
                  >
                </div>
                }
              </div>
              <div class="p-4">
                <h3
                  class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors"
                >
                  {{ relatedProduct.nombre }}
                </h3>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-lg font-bold text-green-600"
                    >S/ {{ relatedProduct.precio | number : '1.2-2' }}</span
                  >
                  @if (relatedProduct.stock_disponible > 0) {
                  <span
                    class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"
                  >
                    Stock: {{ relatedProduct.stock_disponible }}
                  </span>
                  }
                </div>

                <!-- Botones de acción -->
                <div class="space-y-2">
                  @if (relatedProduct.stock_disponible > 0) {
                  <button
                    (click)="addToCart(relatedProduct)"
                    class="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19"
                      />
                    </svg>
                    <span>Agregar</span>
                  </button>
                  <button
                    (click)="goToProduct(relatedProduct.codigo)"
                    class="w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors duration-200"
                  >
                    Ver detalle
                  </button>
                  } @else {
                  <button
                    (click)="goToProduct(relatedProduct.codigo)"
                    class="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors duration-200"
                  >
                    Ver producto
                  </button>
                  }
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        }

        <!-- Otros resultados de búsqueda -->
        @if (searchResults().length > 0 && searchTerm()) {
        <div class="mt-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900">
              <div class="flex items-center space-x-3">
                <div class="w-1 h-8 bg-blue-500 rounded-full"></div>
                <span>Otros resultados para "{{ searchTerm() }}"</span>
              </div>
            </h2>
            <button
              (click)="viewAllSearchResults()"
              class="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
            >
              <span>Ver todos los resultados</span>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (searchProduct of searchResults(); track searchProduct.codigo)
            {
            <div
              class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-blue-200"
            >
              <div
                class="aspect-square bg-gray-50 p-4 relative overflow-hidden"
              >
                <img
                  [src]="searchProduct.imagen_url"
                  [alt]="searchProduct.nombre"
                  class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  (error)="onImageError($event)"
                />
                @if (searchProduct.stock_disponible <= 0) {
                <div
                  class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
                >
                  <span
                    class="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm"
                    >Sin stock</span
                  >
                </div>
                }
              </div>
              <div class="p-4">
                <h3
                  class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors"
                >
                  {{ searchProduct.nombre }}
                </h3>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-lg font-bold text-blue-600"
                    >S/ {{ searchProduct.precio | number : '1.2-2' }}</span
                  >
                  @if (searchProduct.stock_disponible > 0) {
                  <span
                    class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
                  >
                    Stock: {{ searchProduct.stock_disponible }}
                  </span>
                  }
                </div>

                <!-- Botones de acción -->
                <div class="space-y-2">
                  @if (searchProduct.stock_disponible > 0) {
                  <button
                    (click)="addToCart(searchProduct)"
                    class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19"
                      />
                    </svg>
                    <span>Agregar</span>
                  </button>
                  <button
                    (click)="goToProductFromSearch(searchProduct.codigo)"
                    class="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
                  >
                    Ver detalle
                  </button>
                  } @else {
                  <button
                    (click)="goToProductFromSearch(searchProduct.codigo)"
                    class="w-full bg-gray-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors duration-200"
                  >
                    Ver producto
                  </button>
                  }
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        } } @else {
        <!-- Error State -->
        <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div
            class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <p class="text-gray-600 mb-8">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <button
            (click)="goHome()"
            class="bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            Volver al inicio
          </button>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export default class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  readonly cartService = inject(CartService);
  private toastService = inject(ToastService);

  // State
  isLoading = signal(true);
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  searchResults = signal<Product[]>([]);
  codigo = signal<string>('');
  searchTerm = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const codigo = params.get('codigo');
      if (codigo) {
        this.codigo.set(codigo);
        this.loadProduct(codigo);
      }
    });

    // Leer query params para obtener el término de búsqueda
    this.route.queryParamMap.subscribe((queryParams) => {
      const search = queryParams.get('search');
      if (search) {
        this.searchTerm.set(search);
        this.loadSearchResults(search);
      }
    });
  }

  loadProduct(codigo: string) {
    this.isLoading.set(true);
    this.productService.buscarProducto(codigo).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loadRelatedProducts(product);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando producto:', error);
        this.isLoading.set(false);
        this.toastService.showError('Error al cargar el producto', 'Error');
      },
    });
  }

  loadRelatedProducts(product: Product) {
    // Buscar productos relacionados por subcategoría primero, luego por categoría
    const searchTerm = product.subcategoria || product.categoria;
    if (searchTerm) {
      this.productService.buscarProductos(searchTerm, 12).subscribe({
        next: (response) => {
          // Filtrar el producto actual de los relacionados
          const related = response.productos.filter(
            (p) => p.codigo !== product.codigo
          );
          this.relatedProducts.set(related.slice(0, 8)); // Máximo 8 productos relacionados
        },
        error: (error) => {
          console.error('Error cargando productos relacionados:', error);
        },
      });
    }
  }

  loadSearchResults(searchTerm: string) {
    // Cargar otros resultados de búsqueda
    this.productService.buscarProductos(searchTerm, 16).subscribe({
      next: (response) => {
        // Filtrar el producto actual de los resultados
        const currentCode = this.codigo();
        const filtered = response.productos.filter(
          (p) => p.codigo !== currentCode
        );
        this.searchResults.set(filtered.slice(0, 8)); // Máximo 8 productos de búsqueda
      },
      error: (error) => {
        console.error('Error cargando resultados de búsqueda:', error);
      },
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/no-image-placeholder.png';
  }

  goToProduct(codigo: string) {
    // Navegar manteniendo el contexto de búsqueda si existe
    const searchTerm = this.searchTerm();
    if (searchTerm) {
      this.router.navigate(['/product', codigo], {
        queryParams: { search: searchTerm },
      });
    } else {
      this.router.navigate(['/product', codigo]);
    }
  }

  goToProductFromSearch(codigo: string) {
    // Navegar manteniendo el contexto de búsqueda
    const searchTerm = this.searchTerm();
    this.router.navigate(['/product', codigo], {
      queryParams: { search: searchTerm },
    });
  }

  viewAllSearchResults() {
    // Navegar a la página de resultados de búsqueda
    const searchTerm = this.searchTerm();
    if (searchTerm) {
      this.router.navigate(['/search'], {
        queryParams: { q: searchTerm },
      });
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  addToCart(product: Product) {
    try {
      this.cartService.addToCart(product, 1);
      this.toastService.showSuccess(
        'Producto agregado',
        `${product.nombre} se agregó al carrito`
      );
      // Mostrar el carrito brevemente
      this.cartService.showCart();
    } catch (error) {
      this.toastService.showError(
        'Error',
        error instanceof Error
          ? error.message
          : 'No se pudo agregar el producto al carrito'
      );
    }
  }
}
