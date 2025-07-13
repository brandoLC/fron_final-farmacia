import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ProductService,
  SubcategorySearchResponse,
  Product,
} from '../../core/services/product.service';

@Component({
  selector: 'app-subcategory-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header de la subcategoría -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                type="button"
                (click)="goBack()"
                class="flex items-center text-gray-600 hover:text-green-600 transition-colors"
              >
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver
              </button>
              <div class="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ currentSubcategory() }}
                </h1>
                <p class="text-sm text-gray-600 mt-1">
                  {{ totalResults() }} producto(s) encontrado(s)
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <div
                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                Subcategoría
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (isLoading() && products().length === 0) {
        <!-- Loading inicial -->
        <div class="flex justify-center items-center py-20">
          <div class="text-center">
            <div
              class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            ></div>
            <p class="mt-4 text-gray-600 font-medium">Cargando productos...</p>
          </div>
        </div>
        } @else if (products().length === 0) {
        <!-- Sin resultados -->
        <div class="text-center py-20">
          <div
            class="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4m0 0L11 5m4 4v4M7 7v10"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            No hay productos en esta subcategoría
          </h3>
          <p class="text-gray-600 mb-6">
            Actualmente no tenemos productos disponibles en "{{
              currentSubcategory()
            }}"
          </p>
          <button
            type="button"
            (click)="goBack()"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explorar otras subcategorías
          </button>
        </div>
        } @else {
        <!-- Grid de productos -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          @for (product of products(); track product.codigo) {
          <div
            class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer"
            (click)="viewProduct(product.codigo)"
          >
            <!-- Imagen del producto -->
            <div class="aspect-square bg-gray-100 overflow-hidden">
              <img
                [src]="product.imagen_url"
                [alt]="product.nombre"
                class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'"
              />
            </div>

            <!-- Información del producto -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h3
                  class="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors"
                >
                  {{ product.nombre }}
                </h3>
                @if (product.requiere_receta) {
                <span
                  class="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                >
                  Receta
                </span>
                }
              </div>

              <p class="text-xs text-gray-600 mb-2 line-clamp-1">
                {{ product.laboratorio }}
              </p>

              <p class="text-xs text-blue-600 mb-3 font-medium">
                {{ product.categoria }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-lg font-bold text-blue-600">
                    S/{{ product.precio }}
                  </span>
                  <span class="text-xs text-gray-500">
                    Stock: {{ product.stock_disponible }}
                  </span>
                </div>

                <button
                  type="button"
                  class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors group"
                  (click)="
                    $event.stopPropagation(); viewProduct(product.codigo)
                  "
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Paginación -->
        @if (hasMore()) {
        <div class="flex justify-center mt-12">
          <button
            type="button"
            (click)="loadMoreProducts()"
            [disabled]="isLoadingMore()"
            class="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            @if (isLoadingMore()) {
            <div
              class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
            ></div>
            <span>Cargando...</span>
            } @else {
            <span>Cargar más productos</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
            }
          </button>
        </div>
        } }
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-1 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }

      .line-clamp-2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    `,
  ],
})
export class SubcategoryProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  // State
  products = signal<Product[]>([]);
  currentSubcategory = signal<string>('');
  totalResults = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(false);
  nextKey = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const subcategoria = params.get('subcategory');
      if (subcategoria) {
        this.currentSubcategory.set(decodeURIComponent(subcategoria));
        this.searchBySubcategory(subcategoria);
      }
    });
  }

  private searchBySubcategory(subcategoria: string, nextKey?: string) {
    if (!nextKey) {
      this.isLoading.set(true);
      this.products.set([]);
    } else {
      this.isLoadingMore.set(true);
    }

    this.productService
      .buscarProductosPorSubcategoria(subcategoria, 20, nextKey)
      .subscribe({
        next: (response: SubcategorySearchResponse) => {
          if (!nextKey) {
            this.products.set(response.productos);
          } else {
            this.products.update((current) => [
              ...current,
              ...response.productos,
            ]);
          }

          this.totalResults.set(response.count);
          this.hasMore.set(response.paginacion.hay_mas);
          this.nextKey.set(response.paginacion.nextKey);

          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: (error) => {
          console.error('Error buscando productos por subcategoría:', error);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
      });
  }

  loadMoreProducts() {
    const nextKey = this.nextKey();
    const subcategoria = this.currentSubcategory();
    if (nextKey && subcategoria) {
      this.searchBySubcategory(subcategoria, nextKey);
    }
  }

  viewProduct(codigo: string) {
    this.router.navigate(['/product', codigo], {
      queryParams: { subcategory: this.currentSubcategory() },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
