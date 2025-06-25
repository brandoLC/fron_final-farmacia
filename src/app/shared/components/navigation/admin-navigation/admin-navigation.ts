import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative group">
      <!-- Separador visual -->
      <div
        class="w-px h-6 bg-gradient-to-b from-blue-200 to-blue-400 mx-4"
      ></div>

      <!-- Botón de administración con gradiente -->
      <button
        class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <svg
          class="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-blue-700 font-semibold text-sm">Administración</span>
        <span
          class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold"
          >ADMIN</span
        >
        <svg
          class="w-4 h-4 text-blue-500 transition-transform duration-200 group-hover:rotate-180"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Dropdown de administración -->
      <div
        class="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
      >
        <div class="py-3">
          <!-- Dashboard -->
          <button
            (click)="navigateToAdmin()"
            class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Dashboard</p>
              <p class="text-xs text-gray-500">Panel principal</p>
            </div>
          </button>

          <!-- Productos -->
          <button
            (click)="navigateToProducts()"
            class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 13a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Productos</p>
              <p class="text-xs text-gray-500">Gestionar inventario</p>
            </div>
          </button>

          <!-- Crear Producto -->
          <button
            (click)="navigateToCreateProduct()"
            class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Crear Producto</p>
              <p class="text-xs text-gray-500">Añadir nuevo producto</p>
            </div>
          </button>

          <!-- Separador -->
          <hr class="my-2 border-gray-100" />

          <!-- Categorías -->
          <button
            (click)="navigateToCategories()"
            class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Categorías</p>
              <p class="text-xs text-gray-500">Gestionar categorías</p>
            </div>
          </button>

          <!-- Imágenes -->
          <button
            (click)="navigateToImages()"
            class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Imágenes</p>
              <p class="text-xs text-gray-500">Gestionar imágenes</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminNavigation {
  private router = inject(Router);

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }

  navigateToCreateProduct() {
    this.router.navigate(['/admin/products/create']);
  }

  navigateToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  navigateToImages() {
    this.router.navigate(['/admin/images']);
  }
}
