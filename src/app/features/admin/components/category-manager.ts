import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

interface CategoryData {
  [categoria: string]: string[];
}

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  Gestión de Categorías
                </h1>
                <p class="mt-1 text-gray-600">
                  Administra las categorías y subcategorías de productos
                </p>
              </div>
              <button
                (click)="navigateBack()"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Volver al Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- COLUMNA 1: Crear Nueva Categoría -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Crear Nueva Categoría
            </h2>

            <form
              [formGroup]="categoryForm"
              (ngSubmit)="createCategory()"
              class="space-y-4"
            >
              <div>
                <label
                  for="newCategory"
                  class="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  id="newCategory"
                  formControlName="nombre"
                  placeholder="Ej: Medicamentos"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="hasError('nombre', categoryForm)"
                />
                @if (hasError('nombre', categoryForm)) {
                <p class="mt-1 text-sm text-red-600">El nombre es requerido</p>
                }
              </div>

              <div>
                <label
                  for="categoryDescription"
                  class="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  id="categoryDescription"
                  formControlName="descripcion"
                  rows="3"
                  placeholder="Describe la categoría..."
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                [disabled]="!categoryForm.valid || isSubmitting()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                @if (isSubmitting()) {
                <svg
                  class="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Creando...</span>
                } @else {
                <span>Crear Categoría</span>
                }
              </button>
            </form>
          </div>

          <!-- COLUMNA 2: Agregar Subcategoría -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Agregar Subcategoría
            </h2>

            <form
              [formGroup]="subcategoryForm"
              (ngSubmit)="createSubcategory()"
              class="space-y-4"
            >
              <div>
                <label
                  for="parentCategory"
                  class="block text-sm font-medium text-gray-700"
                >
                  Categoría Principal *
                </label>
                <select
                  id="parentCategory"
                  formControlName="categoria"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="
                    hasError('categoria', subcategoryForm)
                  "
                >
                  <option value="">Selecciona una categoría</option>
                  @for (category of categoryKeys(); track category) {
                  <option [value]="category">{{ category }}</option>
                  }
                </select>
                @if (hasError('categoria', subcategoryForm)) {
                <p class="mt-1 text-sm text-red-600">
                  Selecciona una categoría
                </p>
                }
              </div>

              <div>
                <label
                  for="newSubcategory"
                  class="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Subcategoría *
                </label>
                <input
                  type="text"
                  id="newSubcategory"
                  formControlName="nombre"
                  placeholder="Ej: Analgésicos"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="hasError('nombre', subcategoryForm)"
                />
                @if (hasError('nombre', subcategoryForm)) {
                <p class="mt-1 text-sm text-red-600">El nombre es requerido</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="!subcategoryForm.valid || isSubmittingSubcategory()"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-300 flex items-center justify-center space-x-2"
              >
                @if (isSubmittingSubcategory()) {
                <svg
                  class="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Agregando...</span>
                } @else {
                <span>Agregar Subcategoría</span>
                }
              </button>
            </form>
          </div>

          <!-- COLUMNA 3: Estadísticas -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Estadísticas
            </h2>

            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-blue-600">
                  {{ categoryKeys().length }}
                </div>
                <div class="text-sm text-blue-700">Categorías Totales</div>
              </div>

              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-green-600">
                  {{ getTotalSubcategories() }}
                </div>
                <div class="text-sm text-green-700">Subcategorías Totales</div>
              </div>

              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-purple-600">
                  {{ getAverageSubcategoriesPerCategory() }}
                </div>
                <div class="text-sm text-purple-700">
                  Promedio por Categoría
                </div>
              </div>
            </div>

            <!-- Acciones Rápidas -->
            <div class="mt-6 space-y-2">
              <button
                (click)="refreshCategories()"
                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Actualizar</span>
              </button>

              <button
                (click)="exportCategories()"
                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Categorías y Subcategorías -->
        <div class="mt-8 bg-white rounded-lg shadow-sm border">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              Categorías Existentes
            </h2>
          </div>

          <div class="p-6">
            @if (isLoading()) {
            <div class="flex items-center justify-center py-8">
              <div
                class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              ></div>
              <span class="ml-3 text-gray-600">Cargando categorías...</span>
            </div>
            } @else if (categories() && categoryKeys().length > 0) {
            <div class="space-y-6">
              @for (category of categoryKeys(); track category) {
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3
                    class="text-lg font-medium text-gray-900 flex items-center"
                  >
                    📁 {{ category }}
                    <span
                      class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {{ categories()[category].length }} subcategorías
                    </span>
                  </h3>

                  <div class="flex space-x-2">
                    <button
                      (click)="editCategory(category)"
                      class="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar categoría"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
                    </button>

                    <button
                      (click)="deleteCategory(category)"
                      class="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar categoría"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                @if (categories()[category].length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (subcategory of categories()[category]; track
                  subcategory) {
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {{ subcategory }}
                    <button
                      (click)="deleteSubcategory(category, subcategory)"
                      class="ml-2 text-red-500 hover:text-red-700"
                      title="Eliminar subcategoría"
                    >
                      <svg
                        class="w-3 h-3"
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
                  </span>
                  }
                </div>
                } @else {
                <p class="text-gray-500 text-sm italic">No hay subcategorías</p>
                }
              </div>
              }
            </div>
            } @else {
            <div class="text-center py-8">
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
                  d="M19 11H5a2 2 0 00-2 2v10a2 2 0 002 2h14m-5-4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM9 7h6m8 0h6m-7 4h7m-7 8h7m-7 4h7"
                />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                No hay categorías
              </h3>
              <p class="text-gray-500">
                Crea tu primera categoría para empezar
              </p>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CategoryManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // Signals para el estado del componente
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isSubmittingSubcategory = signal<boolean>(false);
  categories = signal<CategoryData>({});
  categoryKeys = signal<string[]>([]);

  // Formularios
  categoryForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
  });

  subcategoryForm: FormGroup = this.fb.group({
    categoria: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);

    this.productService.obtenerCategorias().subscribe({
      next: (categories: CategoryData) => {
        this.categories.set(categories);
        this.categoryKeys.set(Object.keys(categories));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading.set(false);
      },
    });
  }

  createCategory() {
    if (this.categoryForm.valid) {
      this.isSubmitting.set(true);

      const categoryName = this.categoryForm.value.nombre.trim();

      // Simular creación de categoría (en un sistema real, esto haría una llamada al API)
      setTimeout(() => {
        // Agregar nueva categoría al estado local
        this.categories.update((current) => ({
          ...current,
          [categoryName]: [],
        }));

        this.categoryKeys.update((current) => [...current, categoryName]);

        this.categoryForm.reset();
        this.isSubmitting.set(false);

        alert(`Categoría "${categoryName}" creada exitosamente`);
      }, 1000);
    }
  }

  createSubcategory() {
    if (this.subcategoryForm.valid) {
      this.isSubmittingSubcategory.set(true);

      const categoria = this.subcategoryForm.value.categoria;
      const subcategoria = this.subcategoryForm.value.nombre.trim();

      // Simular creación de subcategoría
      setTimeout(() => {
        // Agregar subcategoría al estado local
        this.categories.update((current) => ({
          ...current,
          [categoria]: [...(current[categoria] || []), subcategoria],
        }));

        this.subcategoryForm.reset();
        this.isSubmittingSubcategory.set(false);

        alert(
          `Subcategoría "${subcategoria}" agregada a "${categoria}" exitosamente`
        );
      }, 1000);
    }
  }

  editCategory(categoryName: string) {
    const newName = prompt(`Editar nombre de la categoría:`, categoryName);

    if (newName && newName.trim() !== categoryName) {
      const trimmedName = newName.trim();

      // Actualizar en el estado local
      this.categories.update((current) => {
        const updated = { ...current };
        updated[trimmedName] = updated[categoryName];
        delete updated[categoryName];
        return updated;
      });

      this.categoryKeys.update((current) =>
        current.map((cat) => (cat === categoryName ? trimmedName : cat))
      );

      alert(`Categoría renombrada a "${trimmedName}"`);
    }
  }

  deleteCategory(categoryName: string) {
    const subcategoriesCount = this.categories()[categoryName]?.length || 0;

    if (
      confirm(
        `¿Estás seguro de eliminar la categoría "${categoryName}"?${
          subcategoriesCount > 0
            ? ` Esto también eliminará ${subcategoriesCount} subcategorías.`
            : ''
        }`
      )
    ) {
      this.categories.update((current) => {
        const updated = { ...current };
        delete updated[categoryName];
        return updated;
      });

      this.categoryKeys.update((current) =>
        current.filter((cat) => cat !== categoryName)
      );

      alert(`Categoría "${categoryName}" eliminada`);
    }
  }

  deleteSubcategory(categoryName: string, subcategoryName: string) {
    if (
      confirm(`¿Estás seguro de eliminar la subcategoría "${subcategoryName}"?`)
    ) {
      this.categories.update((current) => ({
        ...current,
        [categoryName]: current[categoryName].filter(
          (sub) => sub !== subcategoryName
        ),
      }));

      alert(`Subcategoría "${subcategoryName}" eliminada`);
    }
  }

  refreshCategories() {
    this.loadCategories();
  }

  exportCategories() {
    const dataStr = JSON.stringify(this.categories(), null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `categorias_${
      new Date().toISOString().split('T')[0]
    }.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  getTotalSubcategories(): number {
    return Object.values(this.categories()).reduce(
      (total, subcategories) => total + subcategories.length,
      0
    );
  }

  getAverageSubcategoriesPerCategory(): string {
    const categories = this.categoryKeys();
    if (categories.length === 0) return '0';

    const total = this.getTotalSubcategories();
    const average = total / categories.length;
    return average.toFixed(1);
  }

  hasError(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  navigateBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}

export default CategoryManagerComponent;
