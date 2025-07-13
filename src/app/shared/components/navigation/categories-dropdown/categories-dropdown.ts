import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';

export interface CategoryWithSubcategories {
  id: string;
  nombre: string;
  subcategorias: string[];
}

@Component({
  selector: 'app-categories-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Trigger Button -->
      <button
        type="button"
        class="flex items-center space-x-2 text-gray-700 hover:text-green-600 font-semibold text-sm transition-all duration-200 px-3 py-2 rounded-lg hover:bg-green-50 group"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen()"
      >
        <div class="flex items-center space-x-2">
          <div
            class="w-1.5 h-1.5 bg-green-500 rounded-full group-hover:scale-125 transition-transform"
          ></div>
          <span>Categorías</span>
        </div>
        <svg
          class="w-4 h-4 transition-all duration-200 group-hover:text-green-600"
          [class.rotate-180]="isOpen()"
          [class.text-green-600]="isOpen()"
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

      <!-- Desktop Dropdown -->
      @if (isOpen()) {
      <div
        class="hidden md:block absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-[520px] max-h-[420px] overflow-hidden backdrop-blur-sm"
        style="box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);"
      >
        <div class="flex h-full">
          <!-- Categorías principales -->
          <div
            class="w-1/2 border-r border-gray-100 max-h-[420px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-gray-50 to-white"
          >
            @if (isLoading()) {
            <div class="p-6 text-center">
              <div
                class="animate-spin w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full mx-auto"
              ></div>
              <p class="mt-3 text-sm text-gray-600 font-medium">
                Cargando categorías...
              </p>
            </div>
            } @else { @for (category of categoriesArray(); track category.id) {
            <div
              class="p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-all duration-200 group"
              (mouseenter)="setHoveredCategory(category)"
              (click)="navigateToCategory(category.nombre)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  ></div>
                  <span
                    class="text-gray-700 font-semibold group-hover:text-green-700 transition-colors"
                    >{{ category.nombre }}</span
                  >
                </div>
                @if (category.subcategorias.length > 0) {
                <div class="flex items-center space-x-2">
                  <span
                    class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold"
                  >
                    {{ category.subcategorias.length }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                }
              </div>
            </div>
            } }
          </div>

          <!-- Subcategorías -->
          <div
            class="w-1/2 max-h-[420px] overflow-y-auto custom-scrollbar bg-white"
          >
            @if (hoveredCategory() && hoveredCategory()!.subcategorias.length >
            0) {
            <div class="p-3">
              <div
                class="text-xs font-bold text-green-600 uppercase tracking-wider mb-3 px-3 py-2 bg-green-50 rounded-lg sticky top-0 border border-green-200"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>{{ hoveredCategory()!.nombre }}</span>
                </div>
              </div>
              @for (subcategory of hoveredCategory()!.subcategorias; track
              subcategory) {
              <button
                type="button"
                (click)="navigateToSubcategory(subcategory)"
                class="w-full text-left block px-4 py-2.5 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 rounded-lg transition-all duration-200 flex-shrink-0 group border border-transparent hover:border-green-200"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-green-500 transition-colors"
                  ></div>
                  <span class="font-medium">{{ subcategory }}</span>
                </div>
              </button>
              }
            </div>
            } @else {
            <div
              class="p-6 text-center text-gray-500 h-full flex flex-col justify-center"
            >
              <div
                class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-600">
                Explora nuestras categorías
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Pasa el cursor sobre una categoría
              </p>
            </div>
            }
          </div>
        </div>
      </div>
      }

      <!-- Mobile Modal -->
      @if (isOpen()) {
      <div
        class="md:hidden fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm"
        (click)="closeDropdown()"
      >
        <div
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] overflow-hidden shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Categorías</h3>
            </div>
            <button
              (click)="closeDropdown()"
              class="p-2 hover:bg-white hover:bg-opacity-80 rounded-xl transition-all duration-200"
            >
              <svg
                class="w-6 h-6 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="overflow-y-auto max-h-[calc(75vh-80px)] custom-scrollbar">
            @if (isLoading()) {
            <div class="p-12 text-center">
              <div
                class="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto"
              ></div>
              <p class="mt-4 text-gray-600 font-semibold">
                Cargando categorías...
              </p>
            </div>
            } @else { @for (category of categoriesArray(); track category.id;
            let i = $index) {
            <div class="border-b border-gray-50 last:border-b-0">
              <!-- Categoría principal -->
              <button
                (click)="toggleMobileCategory(i)"
                class="w-full flex items-center justify-between p-5 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full group-hover:scale-110 transition-transform"
                  ></div>
                  <span
                    class="font-bold text-gray-700 group-hover:text-green-700 text-base"
                    >{{ category.nombre }}</span
                  >
                </div>
                @if (category.subcategorias.length > 0) {
                <div class="flex items-center space-x-2">
                  <span
                    class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold"
                  >
                    {{ category.subcategorias.length }}
                  </span>
                  <svg
                    class="w-5 h-5 text-gray-400 transition-all duration-200 group-hover:text-green-500"
                    [class.rotate-180]="openCategoryIndex() === i"
                    [class.text-green-500]="openCategoryIndex() === i"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                }
              </button>

              <!-- Subcategorías -->
              @if (category.subcategorias.length > 0 && openCategoryIndex() ===
              i) {
              <div
                class="bg-gradient-to-r from-gray-50 to-green-50 border-t border-green-100 max-h-52 overflow-y-auto custom-scrollbar"
              >
                @for (subcategory of category.subcategorias; track subcategory)
                {
                <button
                  type="button"
                  (click)="navigateToSubcategory(subcategory)"
                  class="w-full text-left flex items-center px-8 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:text-green-700 transition-all duration-200 group border-l-4 border-transparent hover:border-green-400"
                >
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full mr-3 group-hover:bg-green-500 transition-colors"
                  ></div>
                  <span class="font-semibold">{{ subcategory }}</span>
                </button>
                }
              </div>
              }
            </div>
            } }
          </div>
        </div>
      </div>
      }

      <!-- Background Overlay for Desktop -->
      @if (isOpen()) {
      <div
        class="hidden md:block fixed inset-0 z-40"
        (click)="closeDropdown()"
      ></div>
      }
    </div>
  `,
  styles: [
    `
      .rotate-180 {
        transform: rotate(180deg);
      }

      /* Custom scrollbar styles - Enhanced */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(34, 197, 94, 0.7) rgba(243, 244, 246, 0.5);
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(243, 244, 246, 0.5);
        border-radius: 10px;
        margin: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgb(34, 197, 94),
          rgb(16, 185, 129)
        );
        border-radius: 10px;
        border: 2px solid transparent;
        background-clip: content-box;
        transition: all 0.3s ease;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, rgb(21, 128, 61), rgb(5, 150, 105));
        transform: scale(1.1);
      }

      /* Enhanced animations */
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .dropdown-enter {
        animation: fadeInScale 0.2s ease-out;
      }

      /* Hover effects for better UX */
      .category-hover-effect {
        position: relative;
        overflow: hidden;
      }

      .category-hover-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(34, 197, 94, 0.1),
          transparent
        );
        transition: left 0.5s ease;
      }

      .category-hover-effect:hover::before {
        left: 100%;
      }
    `,
  ],
})
export class CategoriesDropdown {
  private productService = inject(ProductService);
  private router = inject(Router);

  // State
  isOpen = signal(false);
  openCategoryIndex = signal<number | null>(null);
  hoveredCategory = signal<CategoryWithSubcategories | null>(null);

  // Data
  categories = this.productService.categories;
  isLoading = this.productService.isLoading;

  // Computed
  categoriesArray = computed(() => {
    const cats = this.categories();
    return Object.entries(cats).map(([nombre, subcategorias]) => ({
      id: nombre.toLowerCase().replace(/\s+/g, '-'),
      nombre,
      subcategorias: Array.isArray(subcategorias) ? subcategorias : [],
    }));
  });

  constructor() {
    this.productService.obtenerCategorias().subscribe({
      next: (categories) => {
        console.log('Categorías cargadas:', categories);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      },
    });
  }

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.openCategoryIndex.set(null);
      this.hoveredCategory.set(null);
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.openCategoryIndex.set(null);
    this.hoveredCategory.set(null);
  }

  toggleMobileCategory(index: number): void {
    this.openCategoryIndex.update((current) =>
      current === index ? null : index
    );
  }

  setHoveredCategory(category: CategoryWithSubcategories): void {
    this.hoveredCategory.set(category);
  }

  navigateToCategory(categoryName: string): void {
    this.closeDropdown();
    this.router.navigate(['/products/category', categoryName]);
  }

  navigateToSubcategory(subcategoryName: string): void {
    this.closeDropdown();
    this.router.navigate(['/products/subcategory', subcategoryName]);
  }
}
