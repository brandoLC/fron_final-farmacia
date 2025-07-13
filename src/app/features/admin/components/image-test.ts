import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ImageUploadResponse {
  imagen_url: string;
  mensaje?: string;
}

@Component({
  selector: 'app-image-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        🧪 Test API Imágenes
      </h2>

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        (click)="fileInput.click()"
        [class.border-green-500]="selectedFile()"
        [class.bg-green-50]="selectedFile()"
      >
        @if (!selectedFile()) {
        <div class="text-blue-500 text-4xl mb-4">📁</div>
        <p class="text-gray-600">Haz clic para seleccionar una imagen</p>
        <p class="text-sm text-gray-400 mt-2">JPG, PNG, WebP - Máximo 5MB</p>
        } @else {
        <div class="text-green-500 text-4xl mb-4">✅</div>
        <p class="text-gray-800 font-medium">{{ selectedFile()?.name }}</p>
        <p class="text-sm text-gray-500">
          {{ formatFileSize(selectedFile()?.size || 0) }}
        </p>
        }
      </div>

      <input
        #fileInput
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFileSelected($event)"
      />

      <!-- Category Selector -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Categoría:</label
        >
        <select
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          [(ngModel)]="selectedCategory"
        >
          <option value="productos">🧴 Productos</option>
          <option value="medicamentos">💊 Medicamentos</option>
          <option value="promociones">🎯 Promociones</option>
        </select>
      </div>

      <!-- Upload Button -->
      <button
        (click)="uploadImage()"
        [disabled]="!selectedFile() || isUploading()"
        class="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        @if (isUploading()) {
        <div class="flex items-center justify-center">
          <div
            class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
          ></div>
          Subiendo...
        </div>
        } @else { 📤 Subir Imagen }
      </button>

      <!-- Result -->
      @if (uploadResult()) {
      <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 class="text-lg font-semibold text-green-800 mb-2">✅ ¡Éxito!</h3>
        <p class="text-sm text-gray-600 mb-3">URL de la imagen:</p>
        <div class="bg-white p-3 rounded border break-all font-mono text-sm">
          {{ uploadResult() }}
        </div>
        <button
          (click)="copyUrl()"
          class="mt-3 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          {{ copied() ? '✅ Copiado' : '📋 Copiar URL' }}
        </button>

        <!-- Preview -->
        <div class="mt-4">
          <img
            [src]="uploadResult()"
            class="max-w-full h-48 object-cover rounded-lg shadow"
            alt="Preview"
          />
        </div>
      </div>
      }

      <!-- Error -->
      @if (error()) {
      <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 class="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
        <p class="text-red-600">{{ error() }}</p>
      </div>
      }
    </div>
  `,
})
export class ImageTestComponent {
  private http = inject(HttpClient);

  // API Configuration
  private readonly API_URL =
    'https://widxi4kx6i.execute-api.us-east-1.amazonaws.com/dev';

  // Signals
  selectedFile = signal<File | null>(null);
  selectedCategory = 'productos';
  isUploading = signal<boolean>(false);
  uploadResult = signal<string>('');
  error = signal<string>('');
  copied = signal<boolean>(false);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validations
    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      this.error.set('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.selectedFile.set(file);
    this.error.set('');
    this.uploadResult.set('');
  }

  async uploadImage() {
    const file = this.selectedFile();
    if (!file) return;

    try {
      this.isUploading.set(true);
      this.error.set('');

      // Convert to base64
      const base64 = await this.fileToBase64(file);

      // Prepare request data
      const requestData = {
        categoria: this.selectedCategory,
        nombre_archivo: file.name,
        contenido_archivo: base64,
      };

      console.log('🚀 Enviando request:', {
        url: `${this.API_URL}/s3/subir-imagen-farmacia`,
        categoria: this.selectedCategory,
        nombre_archivo: file.name,
        size: file.size,
      });

      // Make API call
      const response = await this.http
        .post<any>(`${this.API_URL}/s3/subir-imagen-farmacia`, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      console.log('✅ Respuesta recibida:', response);

      // Handle response
      const responseData =
        typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response;

      if (responseData.imagen_url) {
        this.uploadResult.set(responseData.imagen_url);
        console.log('🎉 URL de imagen:', responseData.imagen_url);
      } else {
        throw new Error(responseData.mensaje || 'No se recibió URL de imagen');
      }
    } catch (err: any) {
      console.error('❌ Error al subir imagen:', err);
      this.error.set(err.message || 'Error al subir la imagen');
    } finally {
      this.isUploading.set(false);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  copyUrl() {
    navigator.clipboard.writeText(this.uploadResult()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}

// Export default para lazy loading
export default ImageTestComponent;
