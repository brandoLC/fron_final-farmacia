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
import { AuthService } from '../../../core/services/auth.service';

interface ImageItem {
  url: string;
  name: string;
  category: string;
  uploadDate: Date;
  size: number;
  dimensions?: { width: number; height: number };
}

interface ImageUploadResponse {
  imagen_url: string;
  mensaje?: string;
}

@Component({
  selector: 'app-image-manager',
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
                  Gestión de Imágenes
                </h1>
                <p class="mt-1 text-gray-600">
                  Administra las imágenes de productos y contenido
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
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- COLUMNA 1: Subir Nueva Imagen -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Subir Nueva Imagen
            </h2>

            <!-- Upload Area -->
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors mb-4"
              [class.border-blue-500]="isDragOver()"
              [class.bg-blue-50]="isDragOver()"
              [class.border-green-500]="previewUrl()"
              [class.bg-green-50]="previewUrl()"
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              @if (isUploading()) {
              <div class="text-center">
                <div
                  class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                ></div>
                <p class="text-blue-600 font-medium">Subiendo imagen...</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="uploadProgress()"
                  ></div>
                </div>
              </div>
              } @else if (previewUrl()) {
              <div class="text-center">
                <img
                  [src]="previewUrl()"
                  class="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                  alt="Preview"
                />
                <p class="text-green-600 font-medium text-sm">
                  ✅ Lista para subir
                </p>
                <p class="text-xs text-gray-500">Haz clic para cambiar</p>
              </div>
              } @else {
              <div class="text-center">
                <svg
                  class="w-10 h-10 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <p class="text-gray-600 font-medium text-sm">
                  Arrastra una imagen
                </p>
                <p class="text-xs text-gray-500">o haz clic para seleccionar</p>
                <p class="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP - Max 5MB
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
              multiple
            />

            <!-- Configuración de Subida -->
            <form [formGroup]="uploadForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Categoría:</label
                >
                <select
                  formControlName="categoria"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="productos">🧴 Productos</option>
                  <option value="medicamentos">💊 Medicamentos</option>
                  <option value="promociones">🎯 Promociones</option>
                  <option value="general">📂 General</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Nombre personalizado:</label
                >
                <input
                  type="text"
                  formControlName="nombre"
                  placeholder="Opcional: nombre de archivo"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                type="button"
                (click)="uploadImage()"
                [disabled]="!previewUrl() || isUploading()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:bg-gray-300 text-sm"
              >
                Subir Imagen
              </button>
            </form>
          </div>

          <!-- COLUMNA 2-4: Galería de Imágenes -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Filtros y Búsqueda -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                  <input
                    type="text"
                    [(ngModel)]="searchTerm"
                    (input)="filterImages()"
                    placeholder="Buscar imágenes por nombre..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <select
                    [(ngModel)]="selectedCategory"
                    (change)="filterImages()"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    <option value="productos">🧴 Productos</option>
                    <option value="medicamentos">💊 Medicamentos</option>
                    <option value="promociones">🎯 Promociones</option>
                    <option value="general">📂 General</option>
                  </select>
                </div>

                <div class="flex space-x-2">
                  <button
                    (click)="toggleViewMode()"
                    class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    title="Cambiar vista"
                  >
                    @if (viewMode() === 'grid') {
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    } @else {
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    }
                  </button>

                  <button
                    (click)="refreshImages()"
                    class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    title="Actualizar"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="bg-white rounded-lg shadow-sm border p-4">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ getTotalImages() }}
                  </div>
                  <div class="text-sm text-gray-600">Total Imágenes</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {{ getImagesInCategory('productos') }}
                  </div>
                  <div class="text-sm text-gray-600">Productos</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">
                    {{ getImagesInCategory('medicamentos') }}
                  </div>
                  <div class="text-sm text-gray-600">Medicamentos</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-600">
                    {{ getTotalSize() }}
                  </div>
                  <div class="text-sm text-gray-600">Espacio Usado</div>
                </div>
              </div>
            </div>

            <!-- Galería -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              @if (isLoadingImages()) {
              <div class="flex items-center justify-center py-12">
                <div
                  class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                ></div>
                <span class="ml-3 text-gray-600">Cargando imágenes...</span>
              </div>
              } @else if (filteredImages().length === 0) {
              <div class="text-center py-12">
                <svg
                  class="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  No hay imágenes
                </h3>
                <p class="text-gray-500">
                  {{
                    searchTerm() || selectedCategory
                      ? 'No se encontraron imágenes con los filtros aplicados'
                      : 'Sube tu primera imagen para comenzar'
                  }}
                </p>
              </div>
              } @else { @if (viewMode() === 'grid') {
              <!-- Vista de Cuadrícula -->
              <div
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              >
                @for (image of filteredImages(); track image.url) {
                <div
                  class="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
                >
                  <img
                    [src]="image.url"
                    [alt]="image.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    (error)="onImageError($event)"
                  />

                  <!-- Overlay con acciones -->
                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center"
                  >
                    <div
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                    >
                      <button
                        (click)="viewImage(image)"
                        class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                        title="Ver imagen"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fill-rule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>

                      <button
                        (click)="copyImageUrl(image.url)"
                        class="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                        title="Copiar URL"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 00-1 1v.5a.5.5 0 01-1 0V5a2 2 0 012-2z"
                          />
                          <path
                            d="M6 6a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V6z"
                          />
                        </svg>
                      </button>

                      <button
                        (click)="deleteImage(image)"
                        class="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                        title="Eliminar imagen"
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

                  <!-- Información de la imagen -->
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 text-white text-xs"
                  >
                    <p class="font-medium truncate">{{ image.name }}</p>
                    <p class="text-gray-200">
                      {{ getCategoryIcon(image.category) }} {{ image.category }}
                    </p>
                  </div>
                </div>
                }
              </div>
              } @else {
              <!-- Vista de Lista -->
              <div class="space-y-3">
                @for (image of filteredImages(); track image.url) {
                <div
                  class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <img
                    [src]="image.url"
                    [alt]="image.name"
                    class="w-16 h-16 object-cover rounded-lg"
                    (error)="onImageError($event)"
                  />

                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">
                      {{ image.name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ getCategoryIcon(image.category) }} {{ image.category }}
                    </p>
                    <p class="text-xs text-gray-400">
                      {{ formatFileSize(image.size) }} •
                      {{ formatDate(image.uploadDate) }}
                    </p>
                  </div>

                  <div class="flex space-x-2">
                    <button
                      (click)="viewImage(image)"
                      class="p-2 text-gray-400 hover:text-blue-600"
                      title="Ver imagen"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>

                    <button
                      (click)="copyImageUrl(image.url)"
                      class="p-2 text-gray-400 hover:text-green-600"
                      title="Copiar URL"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 00-1 1v.5a.5.5 0 01-1 0V5a2 2 0 012-2z"
                        />
                        <path
                          d="M6 6a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V6z"
                        />
                      </svg>
                    </button>

                    <button
                      (click)="deleteImage(image)"
                      class="p-2 text-gray-400 hover:text-red-600"
                      title="Eliminar imagen"
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
                }
              </div>
              } }
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para ver imagen -->
      @if (selectedImage()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        (click)="closeImageModal()"
      >
        <div
          class="bg-white rounded-lg max-w-4xl max-h-full overflow-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="p-4 border-b">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ selectedImage()!.name }}</h3>
              <button
                (click)="closeImageModal()"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="p-4">
            <img
              [src]="selectedImage()!.url"
              [alt]="selectedImage()!.name"
              class="w-full h-auto max-h-96 object-contain rounded-lg"
            />

            <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="font-medium text-gray-700">URL:</dt>
                <dd class="text-gray-600 break-all">
                  {{ selectedImage()!.url }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-700">Categoría:</dt>
                <dd class="text-gray-600">
                  {{ getCategoryIcon(selectedImage()!.category) }}
                  {{ selectedImage()!.category }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-700">Tamaño:</dt>
                <dd class="text-gray-600">
                  {{ formatFileSize(selectedImage()!.size) }}
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-700">Fecha de subida:</dt>
                <dd class="text-gray-600">
                  {{ formatDate(selectedImage()!.uploadDate) }}
                </dd>
              </div>
            </div>

            <div class="mt-4 flex space-x-3">
              <button
                (click)="copyImageUrl(selectedImage()!.url)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Copiar URL
              </button>
              <button
                (click)="downloadImage(selectedImage()!)"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `,
})
export class ImageManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // API URLs
  private readonly IMAGE_API_URL =
    'https://7948u54u3h.execute-api.us-east-1.amazonaws.com/dev';

  // Signals para el estado del componente
  isUploading = signal<boolean>(false);
  isLoadingImages = signal<boolean>(false);
  isDragOver = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  previewUrl = signal<string>('');
  allImages = signal<ImageItem[]>([]);
  filteredImages = signal<ImageItem[]>([]);
  selectedImage = signal<ImageItem | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');

  // Filtros
  searchTerm = signal<string>('');
  selectedCategory = '';

  // Formulario de subida
  uploadForm: FormGroup = this.fb.group({
    categoria: ['productos'],
    nombre: [''],
  });

  // Variable para archivo seleccionado
  selectedFile: File | null = null;

  ngOnInit() {
    this.loadMockImages(); // En un sistema real, esto cargaría desde la API
  }

  // Mock data para demostración
  loadMockImages() {
    this.isLoadingImages.set(true);

    // Simular carga de imágenes
    setTimeout(() => {
      const mockImages: ImageItem[] = [
        {
          url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
          name: 'paracetamol_500mg.jpg',
          category: 'medicamentos',
          uploadDate: new Date('2024-01-15'),
          size: 245760,
        },
        {
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
          name: 'vitamina_c.jpg',
          category: 'productos',
          uploadDate: new Date('2024-01-14'),
          size: 189440,
        },
        {
          url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
          name: 'promocion_enero.jpg',
          category: 'promociones',
          uploadDate: new Date('2024-01-13'),
          size: 512000,
        },
      ];

      this.allImages.set(mockImages);
      this.filteredImages.set(mockImages);
      this.isLoadingImages.set(false);
    }, 1000);
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
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    // Para esta demo, solo tomamos el primer archivo
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.selectedFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async uploadImage() {
    if (!this.selectedFile) return;

    try {
      this.isUploading.set(true);
      this.uploadProgress.set(0);

      // Convert to base64
      const base64 = await this.fileToBase64(this.selectedFile);

      // Simular progreso
      const progressInterval = setInterval(() => {
        this.uploadProgress.update((current) => Math.min(current + 10, 90));
      }, 100);

      // Prepare request data
      const requestData = {
        categoria: this.uploadForm.value.categoria,
        nombre_archivo: this.uploadForm.value.nombre || this.selectedFile.name,
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

      clearInterval(progressInterval);
      this.uploadProgress.set(100);

      // Handle response
      const responseData =
        typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response;

      if (responseData.imagen_url) {
        // Agregar nueva imagen al estado local
        const newImage: ImageItem = {
          url: responseData.imagen_url,
          name: this.uploadForm.value.nombre || this.selectedFile.name,
          category: this.uploadForm.value.categoria,
          uploadDate: new Date(),
          size: this.selectedFile.size,
        };

        this.allImages.update((current) => [newImage, ...current]);
        this.filterImages();

        // Reset form
        this.selectedFile = null;
        this.previewUrl.set('');
        this.uploadForm.patchValue({ nombre: '' });

        alert('¡Imagen subida exitosamente!');
      } else {
        throw new Error('No se recibió URL de imagen');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(
        'Error al subir la imagen: ' + (error.message || 'Error desconocido')
      );
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
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

  filterImages() {
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory;

    this.filteredImages.set(
      this.allImages().filter((image) => {
        const matchesSearch =
          !search || image.name.toLowerCase().includes(search);
        const matchesCategory = !category || image.category === category;
        return matchesSearch && matchesCategory;
      })
    );
  }

  toggleViewMode() {
    this.viewMode.update((current) => (current === 'grid' ? 'list' : 'grid'));
  }

  refreshImages() {
    this.loadMockImages();
  }

  viewImage(image: ImageItem) {
    this.selectedImage.set(image);
  }

  closeImageModal() {
    this.selectedImage.set(null);
  }

  copyImageUrl(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('URL copiada al portapapeles');
      })
      .catch(() => {
        alert('Error al copiar URL');
      });
  }

  downloadImage(image: ImageItem) {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    link.target = '_blank';
    link.click();
  }

  deleteImage(image: ImageItem) {
    if (confirm(`¿Estás seguro de eliminar la imagen "${image.name}"?`)) {
      this.allImages.update((current) =>
        current.filter((img) => img.url !== image.url)
      );
      this.filterImages();
      alert('Imagen eliminada');
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
  }

  // Utility methods
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      productos: '🧴',
      medicamentos: '💊',
      promociones: '🎯',
      general: '📂',
    };
    return icons[category] || '📁';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTotalImages(): number {
    return this.allImages().length;
  }

  getImagesInCategory(category: string): number {
    return this.allImages().filter((img) => img.category === category).length;
  }

  getTotalSize(): string {
    const totalBytes = this.allImages().reduce((sum, img) => sum + img.size, 0);
    return this.formatFileSize(totalBytes);
  }

  navigateBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}

export default ImageManagerComponent;
