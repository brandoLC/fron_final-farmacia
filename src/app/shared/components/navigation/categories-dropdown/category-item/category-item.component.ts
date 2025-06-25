import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryWithSubcategories } from '../categories-dropdown';
import { SubcategoryListComponent } from '../subcategory-list/subcategory-list.component';

@Component({
  selector: 'app-category-item',
  standalone: true,
  imports: [CommonModule, RouterModule, SubcategoryListComponent],
  template: `
    <div class="category-item">
      <!-- Elemento de categoría principal -->
      <a
        [routerLink]="['/products/category', category.nombre]"
        class="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 group/category border-l-2 border-transparent hover:border-green-400"
        [attr.aria-label]="
          'Categoria ' +
          category.nombre +
          ' con ' +
          category.subcategorias.length +
          ' subcategorías'
        "
        role="menuitem"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"
            aria-hidden="true"
          ></div>
          <span class="font-medium">{{ category.nombre }}</span>
        </div>
        @if (hasSubcategories) {
        <div class="flex items-center space-x-2">
          <span
            class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium"
            [attr.aria-label]="category.subcategorias.length + ' subcategorías'"
          >
            {{ category.subcategorias.length }}
          </span>
          <svg
            class="w-3 h-3 text-gray-400 group-hover/category:text-green-500 transition-colors"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        }
      </a>

      <!-- Panel de subcategorías -->
      @if (hasSubcategories) {
      <app-subcategory-list
        [category]="category"
        [isVisible]="showSubcategories"
        (subcategoryClick)="subcategoryClick.emit($event)"
      />
      }
    </div>
  `,
  styles: [
    `
      .category-item {
        position: relative;
        overflow: visible;
      }

      /* Mostrar subcategorías al hacer hover */
      .category-item:hover app-subcategory-list {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateX(0) !important;
        pointer-events: auto;
      }

      /* Crear zona de hover para evitar que desaparezca */
      .category-item::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: -320px;
        bottom: 0;
        z-index: -1;
        pointer-events: none;
      }

      @media (max-width: 768px) {
        .category-item::after {
          display: none;
        }
      }
    `,
  ],
})
export class CategoryItemComponent {
  @Input({ required: true }) category!: CategoryWithSubcategories;
  @Input() showSubcategories = false;
  @Output() subcategoryClick = new EventEmitter<string>();

  get hasSubcategories(): boolean {
    return this.category.subcategorias.length > 0;
  }
}
