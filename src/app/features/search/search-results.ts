import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ProductService,
  Product,
  SearchResponse,
} from '../../core/services/product.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header de búsqueda -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  Resultados de búsqueda
                </h1>
                @if (searchTerm()) {
                <p class="mt-1 text-gray-600">
                  {{ totalResults() }} resultado{{
                    totalResults() !== 1 ? 's' : ''
                  }}
                  para
                  <span class="font-semibold text-green-600"
                    >"{{ searchTerm() }}"</span
                  >
                </p>
                }
              </div>

              <!-- Nueva búsqueda -->
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    [(ngModel)]="newSearchTerm"
                    (keydown.enter)="performNewSearch()"
                    class="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <button
                  (click)="performNewSearch()"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (isLoading()) {
        <!-- Estado de carga -->
        <div class="text-center py-12">
          <div
            class="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Buscando productos...</p>
        </div>
        } @else { @if (products().length === 0) {
        <!-- Sin resultados -->
        <div class="text-center py-12">
          <svg
            class="w-24 h-24 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.207-1.955c-.814-.814-.814-2.135 0-2.949L8.343 13.5a4 4 0 015.314 0L15.207 15c.814.814.814 2.135 0 2.949A7.962 7.962 0 0112 20z"
            />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            No pudimos encontrar productos que coincidan con tu búsqueda. Prueba
            con términos diferentes o explora nuestras categorías.
          </p>
          <div class="flex justify-center space-x-4">
            <button
              (click)="clearSearch()"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver todos los productos
            </button>
            <button
              (click)="goHome()"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
        } @else {
        <!-- Grid de productos -->
        <div class="space-y-6">
          @for (product of products(); track product.codigo) {
          <div
            class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div class="flex h-40">
              <!-- Imagen del producto -->
              <div class="w-40 h-40 bg-gray-200 flex-shrink-0">
                @if (product.imagen_url) {
                <img
                  [src]="product.imagen_url"
                  [alt]="product.nombre"
                  class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                } @else {
                <div
                  class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                >
                  <svg
                    class="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                }
              </div>

              <!-- Información del producto -->
              <div class="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between mb-2">
                    <h3
                      class="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors"
                    >
                      {{ product.nombre }}
                    </h3>
                    @if (product.requiere_receta) {
                    <span
                      class="ml-2 px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full flex-shrink-0"
                    >
                      Rx
                    </span>
                    }
                  </div>

                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                    {{ product.descripcion }}
                  </p>

                  <div
                    class="flex items-center space-x-4 text-sm text-gray-500 mb-3"
                  >
                    <span class="flex items-center">
                      <span
                        class="w-2 h-2 bg-blue-500 rounded-full mr-2"
                      ></span>
                      {{ product.categoria }}
                    </span>
                    @if (product.subcategoria) {
                    <span class="flex items-center">
                      <span
                        class="w-2 h-2 bg-green-500 rounded-full mr-2"
                      ></span>
                      {{ product.subcategoria }}
                    </span>
                    }
                    <span class="flex items-center">
                      <span
                        class="w-2 h-2 bg-purple-500 rounded-full mr-2"
                      ></span>
                      {{ product.laboratorio }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <span class="text-2xl font-bold text-green-600">
                      S/. {{ product.precio | number : '1.2-2' }}
                    </span>
                    <span [class]="getStockClass(product.stock_disponible)">
                      Stock: {{ product.stock_disponible }}
                    </span>
                  </div>

                  <button
                    (click)="viewProduct(product.codigo)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Ver producto
                  </button>
                </div>
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Paginación -->
        @if (hasMore()) {
        <div class="text-center mt-8">
          <button
            (click)="loadMore()"
            [disabled]="isLoadingMore()"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            @if (isLoadingMore()) {
            <div class="flex items-center space-x-2">
              <div
                class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              ></div>
              <span>Cargando...</span>
            </div>
            } @else { Cargar más productos }
          </button>
        </div>
        } } }
      </div>
    </div>
  `,
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private destroy$ = new Subject<void>();

  // Signals
  searchTerm = signal<string>('');
  products = signal<Product[]>([]);
  totalResults = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(false);
  nextKey = signal<string | null>(null);

  // Para nueva búsqueda
  newSearchTerm = '';

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const query = params['q'];
        if (query) {
          this.searchTerm.set(query);
          this.newSearchTerm = query;
          this.performSearch(query);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private performSearch(term: string, nextKey?: string) {
    if (!nextKey) {
      this.isLoading.set(true);
      this.products.set([]);
    } else {
      this.isLoadingMore.set(true);
    }

    this.productService.buscarProductos(term, 20, nextKey).subscribe({
      next: (response: SearchResponse) => {
        if (!nextKey) {
          this.products.set(response.productos);
        } else {
          this.products.update((current) => [
            ...current,
            ...response.productos,
          ]);
        }

        this.totalResults.set(response.count);
        this.hasMore.set(response.pagination.hasMore);
        this.nextKey.set(response.pagination.nextKey);

        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  performNewSearch() {
    const term = this.newSearchTerm.trim();
    if (term) {
      this.router.navigate(['/search'], { queryParams: { q: term } });
    }
  }

  loadMore() {
    const term = this.searchTerm();
    const nextKey = this.nextKey();

    if (term && nextKey && !this.isLoadingMore()) {
      this.performSearch(term, nextKey);
    }
  }

  viewProduct(codigo: string) {
    // Pasar el término de búsqueda como query param para mantener contexto
    const searchTerm = this.searchTerm();
    this.router.navigate(['/product', codigo], {
      queryParams: searchTerm ? { search: searchTerm } : {},
    });
  }

  clearSearch() {
    this.router.navigate(['/products']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  getStockClass(stock: number): string {
    if (stock === 0)
      return 'text-xs px-2 py-1 rounded-full font-bold bg-red-100 text-red-800';
    if (stock < 10)
      return 'text-xs px-2 py-1 rounded-full font-bold bg-yellow-100 text-yellow-800';
    return 'text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-800';
  }
}

export default SearchResultsComponent;
