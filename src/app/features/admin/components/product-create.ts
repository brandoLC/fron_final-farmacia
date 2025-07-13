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
import {
  ProductService,
  CreateProductRequest,
} from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

interface ImageUploadResponse {
  imagen_url: string;
  mensaje?: string;
}

@Component({
  selector: 'app-product-create',
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
                  Crear Nuevo Producto
                </h1>
                <p class="mt-1 text-gray-600">
                  Agrega un nuevo producto al inventario
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
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- COLUMNA IZQUIERDA: Formulario -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Información del Producto
            </h2>

            <form
              [formGroup]="productForm"
              (ngSubmit)="onSubmit()"
              class="space-y-6"
            >
              <!-- Subida de Imagen -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Imagen del Producto *
                </label>

                <!-- Upload Area -->
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  [class.border-blue-500]="isDragOver()"
                  [class.bg-blue-50]="isDragOver()"
                  [class.border-green-500]="previewImageUrl()"
                  [class.bg-green-50]="previewImageUrl()"
                  (click)="fileInput.click()"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                >
                  @if (isUploadingImage()) {
                  <div class="text-center">
                    <div
                      class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    ></div>
                    <p class="text-blue-600 font-medium">Subiendo imagen...</p>
                  </div>
                  } @else if (previewImageUrl()) {
                  <div class="text-center">
                    <img
                      [src]="previewImageUrl()"
                      class="w-24 h-32 object-cover rounded-lg mx-auto mb-4 shadow-sm border"
                      alt="Preview"
                    />
                    <p class="text-green-600 font-medium">
                      ✅ Imagen subida exitosamente
                    </p>
                    <p class="text-sm text-gray-500 mt-1">
                      Haz clic para cambiar
                    </p>
                  </div>
                  } @else {
                  <div class="text-center">
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
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <p class="text-gray-600 font-medium">
                      Arrastra una imagen aquí
                    </p>
                    <p class="text-sm text-gray-500 mt-1">
                      o haz clic para seleccionar
                    </p>
                    <p class="text-xs text-gray-400 mt-2">
                      JPG, PNG, WebP - Máximo 5MB
                    </p>
                  </div>
                  }
                </div>

                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onFileSelected($event)"
                />

                <!-- Selector de categoría de imagen -->
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Categoría de imagen:</label
                  >
                  <select
                    [(ngModel)]="imageCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="productos">🧴 Productos</option>
                    <option value="medicamentos">💊 Medicamentos</option>
                    <option value="promociones">🎯 Promociones</option>
                  </select>
                </div>

                @if (hasError('imagen_url')) {
                <p class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('imagen_url') }}
                </p>
                }
              </div>

              <!-- Información Básica -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Nombre -->
                <div>
                  <label
                    for="nombre"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    placeholder="Ej: Paracetamol 500mg"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('nombre')"
                  />
                  @if (hasError('nombre')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('nombre') }}
                  </p>
                  }
                </div>

                <!-- Precio -->
                <div>
                  <label
                    for="precio"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Precio (S/.) *
                  </label>
                  <input
                    type="number"
                    id="precio"
                    formControlName="precio"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('precio')"
                  />
                  @if (hasError('precio')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('precio') }}
                  </p>
                  }
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label
                  for="descripcion"
                  class="block text-sm font-medium text-gray-700"
                >
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  rows="3"
                  placeholder="Describe las características y beneficios del producto..."
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.border-red-500]="hasError('descripcion')"
                ></textarea>
                @if (hasError('descripcion')) {
                <p class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('descripcion') }}
                </p>
                }
              </div>

              <!-- Categorización -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Categoría -->
                <div>
                  <label
                    for="categoria"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Categoría *
                  </label>
                  <select
                    id="categoria"
                    formControlName="categoria"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('categoria')"
                    (change)="onCategoryChange()"
                  >
                    <option value="">Selecciona una categoría</option>
                    @for (categoria of categoryKeys(); track categoria) {
                    <option [value]="categoria">{{ categoria }}</option>
                    }
                  </select>
                  @if (hasError('categoria')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('categoria') }}
                  </p>
                  }
                </div>

                <!-- Subcategoría -->
                <div>
                  <label
                    for="subcategoria"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Subcategoría
                  </label>
                  <select
                    id="subcategoria"
                    formControlName="subcategoria"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [disabled]="subcategories().length === 0"
                  >
                    <option value="">Selecciona una subcategoría</option>
                    @for (subcategoria of subcategories(); track subcategoria) {
                    <option [value]="subcategoria">{{ subcategoria }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Detalles Adicionales -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Laboratorio -->
                <div>
                  <label
                    for="laboratorio"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Laboratorio *
                  </label>
                  <input
                    type="text"
                    id="laboratorio"
                    formControlName="laboratorio"
                    placeholder="Ej: Bayer, Pfizer..."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('laboratorio')"
                  />
                  @if (hasError('laboratorio')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('laboratorio') }}
                  </p>
                  }
                </div>

                <!-- Presentación -->
                <div>
                  <label
                    for="presentacion"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Presentación *
                  </label>
                  <input
                    type="text"
                    id="presentacion"
                    formControlName="presentacion"
                    placeholder="Ej: Caja x 20 tabletas"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('presentacion')"
                  />
                  @if (hasError('presentacion')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('presentacion') }}
                  </p>
                  }
                </div>
              </div>

              <!-- Stock y Configuración -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Stock -->
                <div>
                  <label
                    for="stock_disponible"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    id="stock_disponible"
                    formControlName="stock_disponible"
                    placeholder="0"
                    min="0"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [class.border-red-500]="hasError('stock_disponible')"
                  />
                  @if (hasError('stock_disponible')) {
                  <p class="mt-1 text-sm text-red-600">
                    {{ getErrorMessage('stock_disponible') }}
                  </p>
                  }
                </div>

                <!-- Requiere Receta -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    ¿Requiere Receta Médica?
                  </label>
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                      <input
                        type="radio"
                        formControlName="requiere_receta"
                        [value]="false"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">No</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="radio"
                        formControlName="requiere_receta"
                        [value]="true"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div
                class="flex justify-end space-x-4 pt-6 border-t border-gray-200"
              >
                <button
                  type="button"
                  (click)="resetForm()"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  [disabled]="
                    isSubmitting() || !productForm.valid || !previewImageUrl()
                  "
                  class="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 flex items-center space-x-2"
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
                  <span>Crear Producto</span>
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- COLUMNA DERECHA: Preview en Tiempo Real -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Vista Previa
            </h2>

            <!-- Card de Producto Preview -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <!-- Imagen del producto -->
                <div class="bg-gray-200 flex items-center justify-center">
                  @if (previewData().imagen_url) {
                  <img
                    [src]="previewData().imagen_url"
                    [alt]="previewData().nombre"
                    class="w-full h-64 object-contain bg-white"
                  />
                  } @else {
                  <div
                    class="flex items-center justify-center h-64 bg-gray-100"
                  >
                    <svg
                      class="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  }
                </div>

                <!-- Información del producto -->
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    {{ previewData().nombre || 'Nombre del producto' }}
                  </h3>

                  <!-- Precio -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl font-bold text-green-600">
                      S/. {{ previewData().precio | number : '1.2-2' }}
                    </span>
                    @if (previewData().stock_disponible > 0) {
                    <span
                      class="text-sm text-green-600 bg-green-100 px-2 py-1 rounded"
                    >
                      ✅ Disponible
                    </span>
                    } @else {
                    <span
                      class="text-sm text-red-600 bg-red-100 px-2 py-1 rounded"
                    >
                      ❌ Agotado
                    </span>
                    }
                  </div>

                  <!-- Información adicional -->
                  @if (previewData().laboratorio) {
                  <p class="text-sm text-gray-600 mb-1">
                    <strong>Laboratorio:</strong>
                    {{ previewData().laboratorio }}
                  </p>
                  } @if (previewData().presentacion) {
                  <p class="text-sm text-gray-600 mb-3">
                    <strong>Presentación:</strong>
                    {{ previewData().presentacion }}
                  </p>
                  }

                  <!-- Categorías -->
                  @if (previewData().categoria) {
                  <div class="mb-3">
                    <span
                      class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {{ previewData().categoria }}
                    </span>
                    @if (previewData().subcategoria) {
                    <span
                      class="ml-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                    >
                      {{ previewData().subcategoria }}
                    </span>
                    }
                  </div>
                  }

                  <!-- Receta -->
                  @if (previewData().requiere_receta) {
                  <div class="mb-3">
                    <span
                      class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                    >
                      🩺 Requiere Receta
                    </span>
                  </div>
                  }

                  <!-- Stock -->
                  <p class="text-sm text-gray-500 mb-4">
                    📦 Stock: {{ previewData().stock_disponible }} unidades
                  </p>

                  <!-- Descripción -->
                  @if (previewData().descripcion) {
                  <p class="text-sm text-gray-600 mb-4">
                    {{ previewData().descripcion }}
                  </p>
                  }

                  <!-- Botón de compra (simulado) -->
                  <button
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    disabled
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      />
                    </svg>
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Información del Preview -->
            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-start space-x-2">
                <svg
                  class="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div>
                  <p class="text-sm font-medium text-blue-800">
                    Vista Previa en Tiempo Real
                  </p>
                  <p class="text-xs text-blue-600 mt-1">
                    Los cambios en el formulario se reflejan automáticamente
                    aquí. Así es como verán los clientes tu producto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // API URLs
  private readonly IMAGE_API_URL =
    'https://widxi4kx6i.execute-api.us-east-1.amazonaws.com/dev';

  // Signals para el estado del componente
  isSubmitting = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  isDragOver = signal<boolean>(false);
  previewImageUrl = signal<string>('');
  categoryKeys = signal<string[]>([]);
  subcategories = signal<string[]>([]);

  // Image upload
  imageCategory = 'productos';

  // Signal computed para preview en tiempo real
  previewData = signal({
    nombre: '',
    precio: 0,
    imagen_url: '',
    stock_disponible: 0,
    laboratorio: '',
    presentacion: '',
    categoria: '',
    subcategoria: '',
    descripcion: '',
    requiere_receta: false,
  });

  // Formulario reactivo
  productForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    precio: ['', [Validators.required, Validators.min(0.01)]],
    categoria: ['', Validators.required],
    subcategoria: [''],
    laboratorio: ['', Validators.required],
    presentacion: ['', Validators.required],
    stock_disponible: ['', [Validators.required, Validators.min(0)]],
    requiere_receta: [false],
    imagen_url: ['', Validators.required],
  });

  ngOnInit() {
    // Cargar categorías
    this.loadCategories();

    // Actualizar preview en tiempo real
    this.productForm.valueChanges.subscribe((formValue) => {
      this.previewData.set({
        nombre: formValue.nombre || '',
        precio: parseFloat(formValue.precio) || 0,
        imagen_url: this.previewImageUrl(),
        stock_disponible: parseInt(formValue.stock_disponible) || 0,
        laboratorio: formValue.laboratorio || '',
        presentacion: formValue.presentacion || '',
        categoria: formValue.categoria || '',
        subcategoria: formValue.subcategoria || '',
        descripcion: formValue.descripcion || '',
        requiere_receta: formValue.requiere_receta || false,
      });
    });
  }

  private loadCategories() {
    this.productService.obtenerCategorias().subscribe({
      next: (categories) => {
        this.categoryKeys.set(Object.keys(categories));
      },
    });
  }

  onCategoryChange() {
    const categoria = this.productForm.get('categoria')?.value;
    this.productForm.patchValue({ subcategoria: '' });

    if (categoria) {
      this.productService.obtenerSubcategorias(categoria).subscribe({
        next: (subcategorias) => {
          this.subcategories.set(subcategorias);
        },
      });
    } else {
      this.subcategories.set([]);
    }
  }

  // Image upload methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    // Validations
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.uploadImage(file);
  }

  private async uploadImage(file: File) {
    try {
      this.isUploadingImage.set(true);

      // Convert to base64
      const base64 = await this.fileToBase64(file);

      // Prepare request data
      const requestData = {
        categoria: this.imageCategory,
        nombre_archivo: file.name,
        contenido_archivo: base64,
      };

      // Make API call
      const response = await this.http
        .post<any>(
          `${this.IMAGE_API_URL}/s3/subir-imagen-farmacia`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .toPromise();

      // Handle response
      const responseData =
        typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response;

      if (responseData.imagen_url) {
        this.previewImageUrl.set(responseData.imagen_url);
        this.productForm.patchValue({ imagen_url: responseData.imagen_url });
        this.productForm.get('imagen_url')?.markAsTouched();
      } else {
        throw new Error('No se recibió URL de imagen');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(
        'Error al subir la imagen: ' + (error.message || 'Error desconocido')
      );
    } finally {
      this.isUploadingImage.set(false);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  onSubmit() {
    if (this.productForm.valid && this.previewImageUrl()) {
      this.isSubmitting.set(true);

      const productData: CreateProductRequest = {
        ...this.productForm.value,
        precio: parseFloat(this.productForm.value.precio),
        stock_disponible: parseInt(this.productForm.value.stock_disponible),
        imagen_url: this.previewImageUrl(),
      };

      this.productService.crearProducto(productData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          alert('¡Producto creado exitosamente!');
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          alert('Error al crear producto: ' + error);
        },
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.productForm.controls).forEach((key) => {
        this.productForm.get(key)?.markAsTouched();
      });

      if (!this.previewImageUrl()) {
        alert('Por favor sube una imagen del producto');
      }
    }
  }

  resetForm() {
    this.productForm.reset();
    this.previewImageUrl.set('');
    this.subcategories.set([]);
    this.productForm.patchValue({ requiere_receta: false });
  }

  hasError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} es requerido`;
    if (field.errors['minlength']) return `${fieldName} es muy corto`;
    if (field.errors['min']) return `${fieldName} debe ser mayor a 0`;

    return 'Campo inválido';
  }

  navigateBack() {
    this.router.navigate(['/admin/products']);
  }
}

export default ProductCreateComponent;
