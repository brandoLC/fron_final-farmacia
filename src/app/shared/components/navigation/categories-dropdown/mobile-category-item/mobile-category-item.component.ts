import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryWithSubcategories } from '../categories-dropdown';

@Component({
  selector: 'app-mobile-category-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="border-b border-gray-100 last:border-b-0">
      <!-- Categoría principal -->
      <button
        (click)="onToggleCategory()"
        class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-green-50 transition-colors focus:outline-none focus:bg-green-50"
        type="button"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="'subcategories-' + category.id"
        [attr.aria-label]="
          'Categoría ' +
          category.nombre +
          (hasSubcategories
            ? ', presiona para ' +
              (isOpen ? 'contraer' : 'expandir') +
              ' subcategorías'
            : '')
        "
        role="button"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"
            aria-hidden="true"
          ></div>
          <span class="font-medium text-gray-700">{{ category.nombre }}</span>
        </div>
        <div class="flex items-center space-x-2">
          @if (hasSubcategories) {
          <span
            class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium"
            [attr.aria-label]="category.subcategorias.length + ' subcategorías'"
          >
            {{ category.subcategorias.length }}
          </span>
          <svg
            class="w-4 h-4 text-gray-400 transition-transform"
            [class.rotate-180]="isOpen"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          }
        </div>
      </button>

      <!-- Subcategorías expandibles -->
      @if (hasSubcategories && isOpen) {
      <div
        class="bg-gray-50 border-t border-gray-200"
        [id]="'subcategories-' + category.id"
        role="region"
        [attr.aria-label]="'Subcategorías de ' + category.nombre"
      >
        @for (subcategory of category.subcategorias; track subcategory; let i =
        $index) {
        <a
          [routerLink]="['/products/subcategory', subcategory]"
          (click)="onSubcategoryClick(subcategory)"
          class="block px-8 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors border-l-2 border-transparent hover:border-green-500 focus:outline-none focus:bg-green-50 focus:border-green-500"
          role="menuitem"
          [attr.aria-describedby]="
            'mobile-subcategory-' + category.id + '-' + i
          "
        >
          <div class="flex items-center">
            <span
              class="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0"
              aria-hidden="true"
            ></span>
            <span [id]="'mobile-subcategory-' + category.id + '-' + i">{{
              subcategory
            }}</span>
          </div>
        </a>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .rotate-180 {
        transform: rotate(180deg);
      }
    `,
  ],
})
export class MobileCategoryItemComponent {
  @Input({ required: true }) category!: CategoryWithSubcategories;
  @Input() isOpen = false;
  @Output() categoryToggle = new EventEmitter<void>();
  @Output() subcategoryClick = new EventEmitter<string>();

  get hasSubcategories(): boolean {
    return this.category.subcategorias.length > 0;
  }

  onToggleCategory(): void {
    this.categoryToggle.emit();
  }

  onSubcategoryClick(subcategory: string): void {
    this.subcategoryClick.emit(subcategory);
  }
}
