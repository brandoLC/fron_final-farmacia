import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center justify-center space-x-8">
      <!-- Dashboard -->
      <a
        routerLink="/admin"
        routerLinkActive="text-blue-600"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
          />
        </svg>
        <span>Dashboard</span>
      </a>

      <!-- Productos -->
      <a
        routerLink="/admin/products"
        routerLinkActive="text-blue-600"
        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 13a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Productos</span>
      </a>

      <!-- Categorías -->
      <a
        routerLink="/admin/categories"
        routerLinkActive="text-blue-600"
        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Categorías</span>
      </a>

      <!-- Imágenes -->
      <a
        routerLink="/admin/images"
        routerLinkActive="text-blue-600"
        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Imágenes</span>
      </a>

      <!-- Separador visual -->
      <div class="w-px h-6 bg-gray-300"></div>

      <!-- Badge ADMIN -->
      <div class="flex items-center space-x-2">
        <span
          class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold"
        >
          ADMIN
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      /* Estilos adicionales si son necesarios */
      .admin-nav-item {
        transition: all 0.2s ease-in-out;
      }

      .admin-nav-item:hover {
        transform: translateY(-1px);
      }
    `,
  ],
})
export class AdminNavigation {
  // Lógica del componente si es necesaria
}
