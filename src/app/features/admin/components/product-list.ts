import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ProductService,
  Product,
  FilterProductsParams,
} from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  Gestión de Productos
                </h1>
                <p class="mt-1 text-gray-600">
                  Administra el inventario de la farmacia
                </p>
              </div>
              <button
                (click)="navigateTo('/admin/products/create')"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Filtros de Búsqueda
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Búsqueda por texto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Buscar</label
              >
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Nombre o descripción..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                (input)="onSearchChange()"
              />
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Categoría</label
              >
              <select
                [(ngModel)]="selectedCategory"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                (change)="onCategoryChange()"
              >
                <option value="">Todas las categorías</option>
                @for (category of categoryKeys(); track category) {
                <option [value]="category">{{ category }}</option>
                }
              </select>
            </div>

            <!-- Subcategoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Subcategoría</label
              >
              <select
                [(ngModel)]="selectedSubcategory"
                [disabled]="!selectedCategory"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                (change)="applyFilters()"
              >
                <option value="">Todas las subcategorías</option>
                @for (subcategory of subcategories(); track subcategory) {
                <option [value]="subcategory">{{ subcategory }}</option>
                }
              </select>
            </div>

            <!-- Requiere Receta -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Receta Médica</label
              >
              <select
                [(ngModel)]="requiresPrescription"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                (change)="applyFilters()"
              >
                <option value="">Todos</option>
                <option value="true">Requiere receta</option>
                <option value="false">Sin receta</option>
              </select>
            </div>
          </div>

          <!-- Botones de filtro -->
          <div class="flex items-center space-x-4 mt-4">
            <button
              (click)="clearFilters()"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
            <button
              (click)="applyFilters()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>

        <!-- Lista de Productos -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">
                Productos ({{ products().length }})
              </h2>
              @if (hasAppliedFilters()) {
              <span
                class="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full"
              >
                Filtros aplicados
              </span>
              }
            </div>
          </div>

          @if (isLoading()) {
          <div class="p-8 text-center">
            <div
              class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            ></div>
            <p class="mt-2 text-gray-600">Cargando productos...</p>
          </div>
          } @else { @if (products().length === 0) {
          <div class="p-8 text-center">
            <svg
              class="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 002 2h6a2 2 0 002-2v-5m-16 0h16m-7 13a2 2 0 002-2V9a2 2 0 00-2-2M9 17h6"
              />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p class="text-gray-600 mb-4">
              @if (hasAppliedFilters()) { Prueba ajustando los filtros de
              búsqueda } @else { Comienza agregando tu primer producto }
            </p>
            <button
              (click)="navigateTo('/admin/products/create')"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear Producto
            </button>
          </div>
          } @else {
          <!-- Lista de productos -->
          <div class="space-y-4 p-6">
            @for (product of products(); track product.codigo) {
            <div
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 group"
            >
              <div class="flex h-32 md:h-40">
                <!-- Imagen del producto -->
                <div
                  class="w-32 md:w-40 h-32 md:h-40 bg-gray-200 flex-shrink-0"
                >
                  @if (product.imagen_url) {
                  <img
                    [src]="product.imagen_url"
                    [alt]="product.nombre"
                    class="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                  />
                  } @else {
                  <div
                    class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                  >
                    <svg
                      class="w-8 h-8 md:w-12 md:h-12 text-gray-400"
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
                <div
                  class="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0"
                >
                  <div class="flex-1">
                    <div class="flex items-start justify-between mb-2">
                      <h3
                        class="text-sm md:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors pr-2"
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

                    <p
                      class="text-xs text-gray-500 mb-2 font-mono bg-gray-50 px-2 py-1 rounded inline-block"
                    >
                      {{ product.codigo }}
                    </p>

                    <div class="text-xs text-gray-600 space-y-1 mb-3">
                      <div class="flex items-center">
                        <span
                          class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"
                        ></span>
                        <span class="font-medium truncate">{{
                          product.categoria
                        }}</span>
                      </div>
                      @if (product.subcategoria) {
                      <div class="flex items-center">
                        <span
                          class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"
                        ></span>
                        <span class="truncate">{{ product.subcategoria }}</span>
                      </div>
                      }
                      <div class="flex items-center">
                        <span
                          class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0"
                        ></span>
                        <span class="truncate">{{ product.laboratorio }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-lg md:text-xl font-bold text-green-600">
                      S/. {{ product.precio | number : '1.2-2' }}
                    </span>
                    <span [class]="getStockClass(product.stock_disponible)">
                      Stock: {{ product.stock_disponible }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div
                class="px-3 md:px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between"
              >
                <div class="flex items-center space-x-2 text-xs text-gray-500">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="hidden sm:inline">{{
                    product.fecha_creacion | date : 'dd/MM/yy'
                  }}</span>
                </div>

                <div class="flex items-center space-x-1 md:space-x-2">
                  <button
                    (click)="navigateTo('/admin/products/' + product.codigo)"
                    class="px-2 md:px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
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
                    <span class="hidden sm:inline ml-1">Ver</span>
                  </button>
                  <button
                    (click)="
                      navigateTo('/admin/products/edit/' + product.codigo)
                    "
                    class="px-2 md:px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar producto"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span class="hidden sm:inline ml-1">Editar</span>
                  </button>
                  <button
                    (click)="confirmDelete(product)"
                    class="px-2 md:px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar producto"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span class="hidden sm:inline ml-1">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
            }
          </div>

          <!-- Paginación -->
          @if (hasMore()) {
          <div class="px-6 py-4 border-t border-gray-200 text-center">
            <button
              (click)="loadMore()"
              [disabled]="isLoading()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              @if (isLoading()) {
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
    </div>

    <!-- Modal de confirmación de eliminación -->
    @if (showDeleteModal()) {
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Eliminar Producto
        </h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro que deseas eliminar el producto "{{
            productToDelete()?.nombre
          }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex space-x-4">
          <button
            (click)="cancelDelete()"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            (click)="deleteProduct()"
            [disabled]="isDeleting()"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
          >
            @if (isDeleting()) {
            <div class="flex items-center justify-center">
              <div
                class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              ></div>
              Eliminando...
            </div>
            } @else { Eliminar }
          </button>
        </div>
      </div>
    </div>
    }
  `,
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // Signals del servicio
  isLoading = this.productService.isLoading;
  products = this.productService.products;
  categories = this.productService.categories;

  // Filtros
  searchTerm = '';
  selectedCategory = '';
  selectedSubcategory = '';
  requiresPrescription = '';

  // Signals locales
  subcategories = signal<string[]>([]);
  categoryKeys = signal<string[]>([]);
  hasMore = signal<boolean>(false);
  nextKey = signal<string>('');

  // Modal de eliminación
  showDeleteModal = signal<boolean>(false);
  productToDelete = signal<Product | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts() {
    this.productService.listarProductos().subscribe({
      next: (response) => {
        this.hasMore.set(response.hasMore);
        this.nextKey.set(response.nextKey || '');
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  private loadCategories() {
    this.productService.obtenerCategorias().subscribe({
      next: (categories) => {
        this.categoryKeys.set(Object.keys(categories));
      },
    });
  }

  onSearchChange() {
    // Implementar debounce aquí si es necesario
    if (this.searchTerm.length === 0 || this.searchTerm.length >= 3) {
      this.applyFilters();
    }
  }

  onCategoryChange() {
    this.selectedSubcategory = '';

    if (this.selectedCategory) {
      this.productService
        .obtenerSubcategorias(this.selectedCategory)
        .subscribe({
          next: (subcategories) => {
            this.subcategories.set(subcategories);
          },
        });
    } else {
      this.subcategories.set([]);
    }

    this.applyFilters();
  }

  applyFilters() {
    const params: FilterProductsParams = {};

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategory) params.categoria = this.selectedCategory;
    if (this.selectedSubcategory)
      params.subcategoria = this.selectedSubcategory;
    if (this.requiresPrescription)
      params.requiere_receta = this.requiresPrescription === 'true';

    this.productService.filtrarProductos(params).subscribe({
      next: (response) => {
        this.hasMore.set(response.hasMore);
        this.nextKey.set(response.nextKey || '');
      },
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.requiresPrescription = '';
    this.subcategories.set([]);

    this.loadProducts();
  }

  hasAppliedFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.selectedCategory ||
      this.selectedSubcategory ||
      this.requiresPrescription
    );
  }

  loadMore() {
    if (!this.hasMore() || this.isLoading()) return;

    const params: FilterProductsParams = {
      lastKey: this.nextKey(),
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategory) params.categoria = this.selectedCategory;
    if (this.selectedSubcategory)
      params.subcategoria = this.selectedSubcategory;
    if (this.requiresPrescription)
      params.requiere_receta = this.requiresPrescription === 'true';

    this.productService.filtrarProductos(params).subscribe({
      next: (response) => {
        this.hasMore.set(response.hasMore);
        this.nextKey.set(response.nextKey || '');
      },
    });
  }

  getStockClass(stock: number): string {
    if (stock === 0)
      return 'text-xs px-2 py-1 rounded-full font-bold bg-red-100 text-red-800';
    if (stock < 10)
      return 'text-xs px-2 py-1 rounded-full font-bold bg-yellow-100 text-yellow-800';
    return 'text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-800';
  }

  confirmDelete(product: Product) {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.productToDelete.set(null);
    this.showDeleteModal.set(false);
  }

  deleteProduct() {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);

    this.productService.eliminarProducto(product.codigo).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
        // El producto ya se removió del signal en el servicio
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Error deleting product:', error);
      },
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

export default ProductListComponent;
