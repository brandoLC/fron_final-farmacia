import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header del Dashboard -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p class="mt-1 text-gray-600">
                  Gestiona productos, categorías y más
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <div
                  class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  👑 Admin: {{ userName()?.nombres }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Crear Producto -->
            <button
              (click)="navigateTo('/admin/products/create')"
              class="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
            >
              <div class="flex items-center space-x-3">
                <div class="bg-green-500 p-3 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Crear Producto</h3>
                  <p class="text-sm text-green-200">Agregar nuevo producto</p>
                </div>
              </div>
            </button>

            <!-- Ver Productos -->
            <button
              (click)="navigateTo('/admin/products')"
              class="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
            >
              <div class="flex items-center space-x-3">
                <div class="bg-blue-500 p-3 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Ver Productos</h3>
                  <p class="text-sm text-blue-200">Gestionar inventario</p>
                </div>
              </div>
            </button>

            <!-- Categorías -->
            <button
              (click)="navigateTo('/admin/categories')"
              class="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
            >
              <div class="flex items-center space-x-3">
                <div class="bg-purple-500 p-3 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Categorías</h3>
                  <p class="text-sm text-purple-200">Gestionar categorías</p>
                </div>
              </div>
            </button>

            <!-- Subir Imágenes -->
            <button
              (click)="navigateTo('/admin/images')"
              class="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg shadow-sm transition-colors group"
            >
              <div class="flex items-center space-x-3">
                <div class="bg-orange-500 p-3 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold">Subir Imágenes</h3>
                  <p class="text-sm text-orange-200">Gestionar imágenes</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Resumen General
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Productos -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ totalProducts() }}
                  </h3>
                  <p class="text-sm text-gray-600">Total Productos</p>
                </div>
              </div>
            </div>

            <!-- Categorías -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ totalCategories() }}
                  </h3>
                  <p class="text-sm text-gray-600">Categorías</p>
                </div>
              </div>
            </div>

            <!-- Con Receta -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 01-1 1H8a1 1 0 110-2h4a1 1 0 011 1zm-1 4a1 1 0 100-2H8a1 1 0 100 2h4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ withPrescription() }}
                  </h3>
                  <p class="text-sm text-gray-600">Con Receta</p>
                </div>
              </div>
            </div>

            <!-- Sin Receta -->
            <div class="bg-white p-6 rounded-lg shadow-sm border">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ withoutPrescription() }}
                  </h3>
                  <p class="text-sm text-gray-600">Sin Receta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Products -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              Productos Recientes
            </h2>
          </div>

          @if (isLoading()) {
          <div class="p-8 text-center">
            <div
              class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            ></div>
            <p class="mt-2 text-gray-600">Cargando productos...</p>
          </div>
          } @else { @if (recentProducts().length === 0) {
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
              No hay productos
            </h3>
            <p class="text-gray-600 mb-4">
              Comienza agregando tu primer producto
            </p>
            <button
              (click)="navigateTo('/admin/products/create')"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear Producto
            </button>
          </div>
          } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Producto
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Precio
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (product of recentProducts(); track product.codigo) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      @if (product.imagen_url) {
                      <img
                        class="h-10 w-10 rounded-lg object-cover"
                        [src]="product.imagen_url"
                        [alt]="product.nombre"
                      />
                      } @else {
                      <div
                        class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center"
                      >
                        <svg
                          class="w-6 h-6 text-gray-400"
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
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ product.nombre }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ product.codigo }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {{ product.categoria }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/. {{ product.precio | number : '1.2-2' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStockClass(product.stock_disponible)">
                      {{ product.stock_disponible }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="
                        navigateTo('/admin/products/edit/' + product.codigo)
                      "
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      (click)="navigateTo('/admin/products/' + product.codigo)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="px-6 py-4 border-t border-gray-200">
            <button
              (click)="navigateTo('/admin/products')"
              class="w-full text-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos los productos →
            </button>
          </div>
          } }
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  isLoading = this.productService.isLoading;
  products = this.productService.products;
  categories = this.productService.categories;

  // Computed signals
  userName = this.authService.currentUser;

  totalProducts = signal(0);
  totalCategories = signal(0);
  withPrescription = signal(0);
  withoutPrescription = signal(0);
  recentProducts = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Cargar productos recientes
    this.productService.listarProductos(10).subscribe({
      next: (response) => {
        this.recentProducts.set(response.productos.slice(0, 5));
        this.calculateStats(response.productos);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      },
    });

    // Cargar categorías
    this.productService.obtenerCategorias().subscribe({
      next: (categories) => {
        this.totalCategories.set(Object.keys(categories).length);
      },
    });
  }

  private calculateStats(products: any[]) {
    this.totalProducts.set(products.length);

    const withRx = products.filter((p) => p.requiere_receta).length;
    const withoutRx = products.filter((p) => !p.requiere_receta).length;

    this.withPrescription.set(withRx);
    this.withoutPrescription.set(withoutRx);
  }

  getStockClass(stock: number): string {
    if (stock === 0)
      return 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full';
    if (stock < 10)
      return 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full';
    return 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}

export default AdminDashboardComponent;
