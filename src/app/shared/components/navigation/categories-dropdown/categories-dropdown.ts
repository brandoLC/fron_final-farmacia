import {
  Component,
  inject,
  signal,
  OnInit,
  HostListener,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryItemComponent } from './category-item/category-item.component';
import { MobileCategoryItemComponent } from './mobile-category-item/mobile-category-item.component';

// Interfaces para las categorías
export interface CategoryWithSubcategories {
  id: string;
  nombre: string;
  subcategorias: string[];
}

@Component({
  selector: 'app-categories-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CategoryItemComponent,
    MobileCategoryItemComponent,
  ],
  styles: [
    `
      /* Contenedor con scroll personalizado */
      .categories-scroll {
        overflow-y: auto;
        overflow-x: visible;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: rgb(34 197 94) rgb(243 244 246);
      }

      .categories-scroll::-webkit-scrollbar {
        width: 4px;
      }

      .categories-scroll::-webkit-scrollbar-track {
        background: rgb(243 244 246);
        border-radius: 6px;
      }

      .categories-scroll::-webkit-scrollbar-thumb {
        background: rgb(34 197 94);
        border-radius: 6px;
      }

      .categories-scroll::-webkit-scrollbar-thumb:hover {
        background: rgb(21 128 61);
      }

      /* Mejoras para móviles */
      @media (max-width: 768px) {
        .categories-dropdown-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.5);
        }

        .categories-content-mobile {
          position: absolute;
          top: 10%;
          left: 5%;
          right: 5%;
          max-height: 80%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
      }
    `,
  ],
  template: `
    <div class="relative group categories-dropdown">
      <!-- Button para desktop -->
      <button
        class="hidden md:flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium text-sm transition-colors duration-200"
        type="button"
        [attr.aria-expanded]="false"
        [attr.aria-haspopup]="true"
        [attr.aria-label]="'Menú de categorías, ' + totalCategoriesText"
        role="button"
      >
        <span>Categorías</span>
        <svg
          class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
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
      </button>

      <!-- Button para móvil -->
      <button
        (click)="toggleMobileDropdown()"
        class="md:hidden flex items-center space-x-1 text-gray-700 hover:text-green-600 font-medium text-sm transition-colors duration-200"
        type="button"
        [attr.aria-expanded]="showMobileDropdown()"
        [attr.aria-haspopup]="true"
        [attr.aria-label]="
          'Menú de categorías, ' +
          totalCategoriesText +
          ', presiona para ' +
          (showMobileDropdown() ? 'cerrar' : 'abrir')
        "
        role="button"
      >
        <span>Categorías</span>
        <svg
          class="w-4 h-4 transition-transform duration-200"
          fill="currentColor"
          viewBox="0 0 20 20"
          [class.rotate-180]="showMobileDropdown()"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Dropdown para desktop (hover) -->
      <div
        class="hidden md:block absolute left-0 mt-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30"
        style="overflow: visible;"
        role="menu"
        [attr.aria-label]="
          'Menú de categorías con ' + categoriesWithSubs().length + ' opciones'
        "
      >
        @if (loadingCategories()) {
        <div
          class="p-6 text-center"
          role="status"
          aria-label="Cargando categorías"
        >
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"
            aria-hidden="true"
          ></div>
          <p class="text-sm text-gray-500 mt-2">Cargando categorías...</p>
        </div>
        } @if (hasCategoriesData()) {

        <!-- Header con información de categorías -->
        <div
          class="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 rounded-t-xl"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-800">
              Todas las Categorías
            </h3>
            <span
              class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium"
              [attr.aria-label]="
                categoriesWithSubs().length + ' categorías disponibles'
              "
            >
              {{ categoriesWithSubs().length }} categorías
            </span>
          </div>
          @if (shouldShowScrollHint()) {
          <p class="text-xs text-gray-600 mt-1">
            Usa el scroll para explorar todas las opciones
          </p>
          }
        </div>

        <!-- Contenedor con scroll optimizado para listas largas -->
        <div
          class="py-1 max-h-72 overflow-y-auto categories-scroll"
          style="overflow-x: visible;"
          role="menu"
        >
          @for (category of categoriesWithSubs(); track category.id) {
          <app-category-item
            [category]="category"
            [showSubcategories]="false"
            (subcategoryClick)="onSubcategoryClick($event)"
          />
          }
        </div>

        <!-- Footer con acción para ver todas las categorías -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <a
            routerLink="/products/all"
            class="flex items-center justify-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            role="menuitem"
            aria-label="Ver todos los productos disponibles"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            Ver todos los productos
          </a>
        </div>

        } @if (shouldShowEmptyState()) {
        <div
          class="p-6 text-center"
          role="status"
          aria-label="No hay categorías disponibles"
        >
          <svg
            class="w-12 h-12 text-gray-300 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-gray-500">No hay categorías disponibles</p>
          <p class="text-xs text-gray-400 mt-1">
            Vuelve a intentarlo más tarde
          </p>
        </div>
        }
      </div>

      <!-- Dropdown para móvil (overlay) -->
      @if (showMobileDropdown()) {
      <div
        class="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
        (click)="closeMobileDropdown()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Menú de categorías móvil'"
      >
        <div
          class="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[calc(100vh-5rem)] overflow-hidden"
          (click)="$event.stopPropagation()"
          role="menu"
        >
          @if (loadingCategories()) {
          <div
            class="p-6 text-center"
            role="status"
            aria-label="Cargando categorías"
          >
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"
              aria-hidden="true"
            ></div>
            <p class="text-sm text-gray-500 mt-2">Cargando categorías...</p>
          </div>
          } @else if (hasCategoriesData()) {

          <!-- Header móvil -->
          <div
            class="px-4 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 flex items-center justify-between"
          >
            <div>
              <h3 class="text-sm font-semibold text-gray-800">Categorías</h3>
              <p class="text-xs text-gray-600 mt-1">
                {{ categoriesWithSubs().length }} categorías disponibles
              </p>
            </div>
            <button
              (click)="closeMobileDropdown()"
              class="p-1 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              type="button"
              aria-label="Cerrar menú de categorías"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Contenido scrolleable móvil -->
          <div
            class="overflow-y-auto"
            style="max-height: calc(100vh - 12rem);"
            role="menu"
          >
            @for (category of categoriesWithSubs(); track category.id) {
            <app-mobile-category-item
              [category]="category"
              [isOpen]="isMobileCategoryOpen(category.id)"
              (categoryToggle)="toggleMobileCategory(category.id)"
              (subcategoryClick)="onMobileSubcategoryClick($event)"
            />
            }
          </div>

          <!-- Footer móvil -->
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <a
              routerLink="/products/all"
              (click)="closeMobileDropdown()"
              class="flex items-center justify-center text-sm text-green-600 hover:text-green-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              role="menuitem"
              aria-label="Ver todos los productos disponibles"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Ver todos los productos
            </a>
          </div>

          } @else {
          <div
            class="p-6 text-center"
            role="status"
            aria-label="No hay categorías disponibles"
          >
            <svg
              class="w-12 h-12 text-gray-300 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-sm text-gray-500">No hay categorías disponibles</p>
            <p class="text-xs text-gray-400 mt-1">
              Vuelve a intentarlo más tarde
            </p>
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
})
export class CategoriesDropdown implements OnInit {
  private productService = inject(ProductService);

  // Signals
  categoriesWithSubs = signal<CategoryWithSubcategories[]>([]);
  loadingCategories = signal<boolean>(false);

  // Signals para móvil
  showMobileDropdown = signal<boolean>(false);
  openMobileCategories = signal<Set<string>>(new Set());

  // Computed signals para mejorar el rendimiento y legibilidad
  totalCategoriesText = computed(() => {
    const count = this.categoriesWithSubs().length;
    return count === 0 ? 'sin categorías' : `${count} categorías disponibles`;
  });

  hasCategoriesData = computed(() => {
    return !this.loadingCategories() && this.categoriesWithSubs().length > 0;
  });

  shouldShowEmptyState = computed(() => {
    return !this.loadingCategories() && this.categoriesWithSubs().length === 0;
  });

  shouldShowScrollHint = computed(() => {
    return this.categoriesWithSubs().length > 6;
  });

  ngOnInit() {
    this.loadCategories();
  }

  // Métodos para manejo de subcategorías
  onSubcategoryClick(subcategory: string): void {
    // Opcional: agregar lógica adicional para tracking o analytics
    console.log('Subcategory clicked:', subcategory);
  }

  onMobileSubcategoryClick(subcategory: string): void {
    // Cerrar el dropdown móvil cuando se selecciona una subcategoría
    this.closeMobileDropdown();
    // Opcional: agregar lógica adicional
    console.log('Mobile subcategory clicked:', subcategory);
  }

  // Métodos para manejo del dropdown móvil
  toggleMobileDropdown() {
    this.showMobileDropdown.update((show) => !show);
  }

  closeMobileDropdown() {
    this.showMobileDropdown.set(false);
    this.openMobileCategories.set(new Set());
  }

  toggleMobileCategory(categoryId: string) {
    this.openMobileCategories.update((openCategories) => {
      const newSet = new Set<string>();
      // Solo mantener abierta la categoría seleccionada si no estaba abierta antes
      // Esto asegura que solo una categoría esté expandida a la vez
      if (!openCategories.has(categoryId)) {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }

  isMobileCategoryOpen(categoryId: string): boolean {
    return this.openMobileCategories().has(categoryId);
  }

  // Host listener para cerrar el dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.categories-dropdown')) {
      this.closeMobileDropdown();
    }
  }

  // Host listener para cerrar el dropdown con escape
  @HostListener('document:keydown.escape')
  onEscapePress() {
    this.closeMobileDropdown();
  }

  private loadCategories() {
    this.loadingCategories.set(true);

    this.productService.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Convertir el Record<string, string[]> a CategoryWithSubcategories[]
        const categoriesArray: CategoryWithSubcategories[] = Object.entries(
          categorias
        ).map(([nombre, subcategorias]) => ({
          id: nombre.toLowerCase().replace(/\s+/g, '-'), // Crear ID desde el nombre
          nombre,
          subcategorias,
        }));

        console.log('Categorías cargadas:', categoriesArray);
        this.categoriesWithSubs.set(categoriesArray);
        this.loadingCategories.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categoriesWithSubs.set([]);
        this.loadingCategories.set(false);
      },
    });
  }
}
