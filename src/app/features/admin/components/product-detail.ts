import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ProductService,
  Product,
} from '../../../core/services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  Detalle del Producto
                </h1>
                <p class="mt-1 text-gray-600">
                  {{ currentProduct()?.nombre || 'Cargando...' }}
                </p>
              </div>
              <div class="flex space-x-3">
                <button
                  (click)="navigateToEdit()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    />
                  </svg>
                  <span>Editar</span>
                </button>
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
      </div>

      @if (isLoading()) {
      <!-- Loading State -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-sm border p-8">
          <div class="flex items-center justify-center">
            <div
              class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            ></div>
            <span class="ml-3 text-gray-600">Cargando producto...</span>
          </div>
        </div>
      </div>
      } @else if (loadError()) {
      <!-- Error State -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-50 rounded-lg border border-red-200 p-6">
          <div class="flex items-center">
            <svg
              class="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-red-800">
                Error al cargar el producto
              </h3>
              <p class="text-red-600 mt-1">{{ loadError() }}</p>
              <button
                (click)="loadProduct()"
                class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
      } @else if (currentProduct()) {
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- COLUMNA IZQUIERDA: Imagen e información básica -->
          <div class="space-y-6">
            <!-- Card de Imagen Principal -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <div
                class="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
              >
                <img
                  [src]="currentProduct()!.imagen_url"
                  [alt]="currentProduct()!.nombre"
                  class="w-full h-80 object-contain bg-white"
                  (error)="onImageError($event)"
                />
              </div>

              <!-- Información de disponibilidad -->
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  @if (currentProduct()!.stock_disponible > 0) {
                  <span class="flex items-center text-green-600">
                    <svg
                      class="w-5 h-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Disponible
                  </span>
                  } @else {
                  <span class="flex items-center text-red-600">
                    <svg
                      class="w-5 h-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Agotado
                  </span>
                  }
                </div>

                <div class="flex items-center space-x-2">
                  <span
                    [class]="
                      currentProduct()!.activo
                        ? 'text-green-600 bg-green-100'
                        : 'text-red-600 bg-red-100'
                    "
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ currentProduct()!.activo ? '🟢 Activo' : '🔴 Inactivo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card de Estado del Producto -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Estado del Producto
              </h3>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-2xl font-bold text-gray-900">
                    {{ currentProduct()!.stock_disponible }}
                  </div>
                  <div class="text-sm text-gray-600">Unidades en stock</div>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-2xl font-bold text-green-600">
                    S/. {{ currentProduct()!.precio | number : '1.2-2' }}
                  </div>
                  <div class="text-sm text-gray-600">Precio unitario</div>
                </div>
              </div>

              <!-- Acciones Rápidas -->
              <div class="mt-4 flex space-x-3">
                <button
                  (click)="toggleProductStatus()"
                  [disabled]="isToggling()"
                  class="flex-1 px-4 py-2 border rounded-md text-sm font-medium transition-colors"
                  [class.bg-red-50]="currentProduct()!.activo"
                  [class.border-red-300]="currentProduct()!.activo"
                  [class.text-red-700]="currentProduct()!.activo"
                  [class.hover:bg-red-100]="currentProduct()!.activo"
                  [class.bg-green-50]="!currentProduct()!.activo"
                  [class.border-green-300]="!currentProduct()!.activo"
                  [class.text-green-700]="!currentProduct()!.activo"
                  [class.hover:bg-green-100]="!currentProduct()!.activo"
                >
                  @if (isToggling()) {
                  <div class="flex items-center justify-center">
                    <div
                      class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    ></div>
                    Cambiando...
                  </div>
                  } @else {
                  {{ currentProduct()!.activo ? 'Desactivar' : 'Activar' }}
                  }
                </button>

                <button
                  (click)="deleteProduct()"
                  [disabled]="isDeleting()"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-gray-300"
                >
                  @if (isDeleting()) {
                  <div class="flex items-center justify-center">
                    <div
                      class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    ></div>
                    Eliminando...
                  </div>
                  } @else { Eliminar }
                </button>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: Información detallada -->
          <div class="space-y-6">
            <!-- Card de Información General -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Información General
              </h3>

              <div class="space-y-4">
                <div>
                  <h4 class="text-xl font-semibold text-gray-900 mb-2">
                    {{ currentProduct()!.nombre }}
                  </h4>
                  <p class="text-gray-600">
                    {{ currentProduct()!.descripcion }}
                  </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Laboratorio
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ currentProduct()!.laboratorio }}
                    </dd>
                  </div>

                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Presentación
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ currentProduct()!.presentacion }}
                    </dd>
                  </div>

                  <div>
                    <dt class="text-sm font-medium text-gray-500">Categoría</dt>
                    <dd class="mt-1">
                      <span
                        class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {{ currentProduct()!.categoria }}
                      </span>
                    </dd>
                  </div>

                  @if (currentProduct()!.subcategoria) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Subcategoría
                    </dt>
                    <dd class="mt-1">
                      <span
                        class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {{ currentProduct()!.subcategoria }}
                      </span>
                    </dd>
                  </div>
                  }

                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Requiere Receta
                    </dt>
                    <dd class="mt-1">
                      @if (currentProduct()!.requiere_receta) {
                      <span
                        class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                      >
                        🩺 Sí requiere
                      </span>
                      } @else {
                      <span
                        class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                      >
                        ✅ No requiere
                      </span>
                      }
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card de Información del Sistema -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Información del Sistema
              </h3>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">
                    Código del Producto
                  </dt>
                  <dd class="text-sm text-gray-900 font-mono">
                    {{ currentProduct()!.codigo }}
                  </dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Tenant ID</dt>
                  <dd class="text-sm text-gray-900 font-mono">
                    {{ currentProduct()!.tenant_id }}
                  </dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">
                    Fecha de Creación
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{
                      currentProduct()!.fecha_creacion
                        | date : 'dd/MM/yyyy HH:mm'
                    }}
                  </dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">
                    Última Modificación
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{
                      currentProduct()!.fecha_modificacion
                        | date : 'dd/MM/yyyy HH:mm'
                    }}
                  </dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Estado</dt>
                  <dd class="text-sm text-gray-900">
                    <span
                      [class]="
                        currentProduct()!.activo
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ currentProduct()!.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </dd>
                </div>
              </div>
            </div>

            <!-- Card de Vista Previa del Cliente -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Vista del Cliente
              </h3>

              <!-- Simulación de como ve el cliente -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="bg-gray-200 flex items-center justify-center">
                    <img
                      [src]="currentProduct()!.imagen_url"
                      [alt]="currentProduct()!.nombre"
                      class="w-full h-40 object-contain bg-white"
                    />
                  </div>

                  <div class="p-3">
                    <h4 class="font-semibold text-gray-900 text-sm mb-1">
                      {{ currentProduct()!.nombre }}
                    </h4>
                    <p class="text-xs text-gray-600 mb-2 line-clamp-2">
                      {{ currentProduct()!.descripcion }}
                    </p>

                    <div class="flex items-center justify-between">
                      <span class="text-lg font-bold text-green-600">
                        S/. {{ currentProduct()!.precio | number : '1.2-2' }}
                      </span>

                      @if (currentProduct()!.stock_disponible > 0 &&
                      currentProduct()!.activo) {
                      <button
                        class="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Agregar
                      </button>
                      } @else {
                      <button
                        class="bg-gray-300 text-gray-500 px-3 py-1 rounded text-xs font-medium"
                        disabled
                      >
                        No disponible
                      </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals para el estado del componente
  isLoading = signal<boolean>(true);
  isToggling = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  loadError = signal<string>('');
  currentProduct = signal<Product | null>(null);

  productCode = '';

  ngOnInit() {
    this.productCode = this.route.snapshot.params['codigo'];
    this.loadProduct();
  }

  loadProduct() {
    this.isLoading.set(true);
    this.loadError.set('');

    this.productService.obtenerProductoPorCodigo(this.productCode).subscribe({
      next: (product: Product) => {
        this.currentProduct.set(product);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.loadError.set(error.message || 'Error al cargar el producto');
        this.isLoading.set(false);
      },
    });
  }

  toggleProductStatus() {
    if (!this.currentProduct()) return;

    const newStatus = !this.currentProduct()?.activo;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que quieres ${action} este producto?`)) {
      this.isToggling.set(true);

      this.productService.toggleProductStatus(this.productCode).subscribe({
        next: () => {
          this.currentProduct.update((product) =>
            product ? { ...product, activo: newStatus } : null
          );
          this.isToggling.set(false);
          alert(
            `Producto ${
              action === 'activar' ? 'activado' : 'desactivado'
            } exitosamente`
          );
        },
        error: (error: any) => {
          this.isToggling.set(false);
          alert(`Error al ${action} producto: ` + error);
        },
      });
    }
  }

  deleteProduct() {
    if (!this.currentProduct()) return;

    const productName = this.currentProduct()!.nombre;

    if (
      confirm(
        `¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el producto "${productName}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      this.isDeleting.set(true);

      this.productService.eliminarProducto(this.productCode).subscribe({
        next: () => {
          this.isDeleting.set(false);
          alert('Producto eliminado exitosamente');
          this.router.navigate(['/admin/products']);
        },
        error: (error: any) => {
          this.isDeleting.set(false);
          alert('Error al eliminar producto: ' + error);
        },
      });
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
  }

  navigateBack() {
    this.router.navigate(['/admin/products']);
  }

  navigateToEdit() {
    this.router.navigate(['/admin/products/edit', this.productCode]);
  }
}

export default ProductDetailComponent;
