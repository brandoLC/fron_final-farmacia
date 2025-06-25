import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryWithSubcategories } from '../categories-dropdown';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isVisible || shouldPreload()) {
    <div
      class="subcategories-dropdown bg-white rounded-lg shadow-xl border border-gray-200"
      [class.opacity-0]="!isVisible"
      [class.opacity-100]="isVisible"
      [class.visible]="isVisible"
      [class.invisible]="!isVisible"
      role="menu"
      [attr.aria-label]="'Subcategorías de ' + category.nombre"
    >
      <!-- Header de la subcategoría -->
      <div
        class="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 rounded-t-lg"
      >
        <h4 class="text-sm font-semibold text-green-800 flex items-center">
          <svg
            class="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"
            ></path>
          </svg>
          {{ category.nombre }}
        </h4>
        <p class="text-xs text-green-700 mt-1">
          {{ subcategoryCount }} subcategorías disponibles
        </p>
      </div>

      <!-- Lista de subcategorías con scroll si hay muchas -->
      <div class="py-1 max-h-60 overflow-y-auto subcategories-scroll">
        @for (subcategory of visibleSubcategories(); track subcategory; let i =
        $index) {
        <a
          [routerLink]="['/products/subcategory', subcategory]"
          (click)="onSubcategoryClick(subcategory)"
          class="block px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 border-l-2 border-transparent hover:border-green-500 focus:outline-none focus:bg-green-50 focus:border-green-500"
          role="menuitem"
          [attr.tabindex]="isVisible ? 0 : -1"
          [attr.aria-describedby]="'subcategory-' + i"
        >
          <div class="flex items-center">
            <span
              class="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0"
              aria-hidden="true"
            ></span>
            <span class="truncate" [id]="'subcategory-' + i">{{
              subcategory
            }}</span>
          </div>
        </a>
        }

        <!-- Lazy loading: botón para cargar más si hay muchas subcategorías -->
        @if (hasMoreSubcategories()) {
        <button
          (click)="loadMoreSubcategories()"
          class="w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors focus:outline-none focus:bg-green-50"
          type="button"
        >
          <div class="flex items-center justify-center">
            <svg
              class="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            Ver {{ remainingSubcategoriesCount() }} más
          </div>
        </button>
        }
      </div>

      <!-- Footer si hay muchas subcategorías -->
      @if (showScrollHint) {
      <div
        class="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg"
        role="note"
        aria-label="Información de navegación"
      >
        <p class="text-xs text-gray-500 text-center">
          Usa el scroll para ver todas las subcategorías
        </p>
      </div>
      }
    </div>
    }
  `,
  styles: [
    `
      .subcategories-dropdown {
        opacity: 0;
        visibility: hidden;
        transform: translateX(-10px);
        transition: all 0.3s ease-in-out;
        pointer-events: none;
        position: absolute;
        left: 100%;
        top: 0;
        z-index: 100;
        min-width: 280px;
        max-width: 320px;
        margin-left: 8px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      /* Mantener visible cuando se hace hover sobre las subcategorías */
      .subcategories-dropdown:hover {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateX(0) !important;
        pointer-events: auto;
      }

      /* Estilos para scrollbar personalizada */
      .subcategories-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgb(34 197 94) rgb(243 244 246);
      }

      .subcategories-scroll::-webkit-scrollbar {
        width: 3px;
      }

      .subcategories-scroll::-webkit-scrollbar-track {
        background: rgb(243 244 246);
        border-radius: 4px;
      }

      .subcategories-scroll::-webkit-scrollbar-thumb {
        background: rgb(34 197 94);
        border-radius: 4px;
      }

      .subcategories-scroll::-webkit-scrollbar-thumb:hover {
        background: rgb(21 128 61);
      }

      /* Responsive para pantallas grandes */
      @media (min-width: 1024px) {
        .subcategories-dropdown {
          min-width: 300px;
          max-width: 350px;
        }
      }
    `,
  ],
})
export class SubcategoryListComponent {
  @Input({ required: true }) category!: CategoryWithSubcategories;
  @Input() isVisible = false;
  @Input() lazyLoadThreshold = 10; // Número máximo a mostrar inicialmente
  @Output() subcategoryClick = new EventEmitter<string>();

  // Signal para controlar cuántas subcategorías mostrar
  private visibleCount = signal(10);

  // Computed signals para lazy loading
  visibleSubcategories = computed(() => {
    const count = this.visibleCount();
    return this.category.subcategorias.slice(0, count);
  });

  hasMoreSubcategories = computed(() => {
    return this.category.subcategorias.length > this.visibleCount();
  });

  remainingSubcategoriesCount = computed(() => {
    return this.category.subcategorias.length - this.visibleCount();
  });

  shouldPreload = computed(() => {
    // Precargar si hay pocas subcategorías
    return this.category.subcategorias.length <= this.lazyLoadThreshold;
  });

  get subcategoryCount(): number {
    return this.category.subcategorias.length;
  }

  get showScrollHint(): boolean {
    return this.subcategoryCount > 8;
  }

  loadMoreSubcategories(): void {
    // Cargar más subcategorías (de 5 en 5)
    this.visibleCount.update((current) =>
      Math.min(current + 5, this.category.subcategorias.length)
    );
  }

  onSubcategoryClick(subcategory: string): void {
    this.subcategoryClick.emit(subcategory);
  }
}
