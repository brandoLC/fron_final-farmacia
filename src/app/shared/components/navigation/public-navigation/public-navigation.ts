import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriesDropdown } from '../categories-dropdown/categories-dropdown';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-public-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoriesDropdown],
  template: `
    <div class="flex items-center justify-center space-x-8">
      <!-- Inicio -->
      <a
        routerLink="/"
        routerLinkActive="text-green-600"
        [routerLinkActiveOptions]="{ exact: true }"
        class="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors duration-200"
      >
        Inicio
      </a>

      <!-- Categorías Dropdown - Solo visible si está autenticado -->
      @if (isAuthenticated()) {
      <app-categories-dropdown></app-categories-dropdown>
      } @else {
      <!-- Placeholder para usuarios no autenticados -->
      <span
        class="text-gray-500 text-sm cursor-not-allowed"
        title="Inicia sesión para ver categorías"
      >
        Categorías
      </span>
      }

      <!-- Cuidado Personal -->
      <a
        href="/products/cuidado-personal"
        class="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors duration-200"
      >
        Cuidado Personal
      </a>

      <!-- Ofertas -->
      <a
        href="/products/ofertas"
        class="flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium text-sm transition-colors duration-200"
      >
        <span>Ofertas</span>
        <span
          class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse"
        >
          HOT
        </span>
      </a>
    </div>
  `,
})
export class PublicNavigation {
  private authService = inject(AuthService);

  // Signal para verificar autenticación
  isAuthenticated = this.authService.isAuthenticated;
}
