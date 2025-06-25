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
          <!-- Grid de productos -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
          >
            @for (product of products(); track product.codigo) {
            <div
              class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <!-- Imagen del producto -->
              <div class="aspect-w-1 aspect-h-1 bg-gray-200">
                @if (product.imagen_url) {
                <img
                  [src]="product.imagen_url"
                  [alt]="product.nombre"
                  class="w-full h-48 object-cover"
                />
                } @else {
                <div
                  class="w-full h-48 bg-gray-100 flex items-center justify-center"
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
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
                    {{ product.nombre }}
                  </h3>
                  @if (product.requiere_receta) {
                  <span
                    class="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                  >
                    Rx
                  </span>
                  }
                </div>

                <p class="text-sm text-gray-600 mb-2">{{ product.codigo }}</p>

                <div class="flex items-center justify-between mb-3">
                  <span class="text-xl font-bold text-green-600">
                    S/. {{ product.precio | number : '1.2-2' }}
                  </span>
                  <span [class]="getStockClass(product.stock_disponible)">
                    Stock: {{ product.stock_disponible }}
                  </span>
                </div>

                <div class="mb-3">
                  <span
                    class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {{ product.categoria }}
                  </span>
                  @if (product.subcategoria) {
                  <span
                    class="ml-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {{ product.subcategoria }}
                  </span>
                  }
                </div>

                <!-- Acciones -->
                <div class="flex space-x-2">
                  <button
                    (click)="navigateTo('/admin/products/' + product.codigo)"
                    class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ver
                  </button>
                  <button
                    (click)="
                      navigateTo('/admin/products/edit/' + product.codigo)
                    "
                    class="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Editar
                  </button>
                  <button
                    (click)="confirmDelete(product)"
                    class="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                        clip-rule="evenodd"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 10-2 0v4a1 1 0 102 0V7z"
                        clip-rule="evenodd"
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
    if (stock === 0) return 'text-xs font-medium text-red-600';
    if (stock < 10) return 'text-xs font-medium text-yellow-600';
    return 'text-xs font-medium text-green-600';
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
