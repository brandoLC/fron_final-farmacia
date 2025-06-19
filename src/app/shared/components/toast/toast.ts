import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-4 right-4 z-50 min-w-80 max-w-md transform transition-all duration-500 ease-out"
      [class.translate-x-0]="isVisible()"
      [class.translate-x-full]="!isVisible()"
      [class.opacity-100]="isVisible()"
      [class.opacity-0]="!isVisible()"
      [class.scale-100]="isVisible()"
      [class.scale-95]="!isVisible()"
    >
      <div
        class="bg-white rounded-xl shadow-2xl border-l-4 p-5 flex items-start space-x-4 backdrop-blur-sm border border-gray-100"
        [ngClass]="{
          'border-emerald-500 bg-gradient-to-r from-emerald-50 to-white':
            type() === 'success',
          'border-red-500 bg-gradient-to-r from-red-50 to-white':
            type() === 'error',
          'border-blue-500 bg-gradient-to-r from-blue-50 to-white':
            type() === 'info',
          'border-amber-500 bg-gradient-to-r from-amber-50 to-white':
            type() === 'warning'
        }"
      >
        <!-- Icon con efecto de pulso -->
        <div class="flex-shrink-0">
          @if (type() === 'success') {
          <div class="relative">
            <svg
              class="w-7 h-7 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <div
              class="absolute inset-0 rounded-full bg-emerald-400 opacity-25 animate-ping"
            ></div>
          </div>
          } @else if (type() === 'error') {
          <div class="relative">
            <svg
              class="w-7 h-7 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div
              class="absolute inset-0 rounded-full bg-red-400 opacity-25 animate-ping"
            ></div>
          </div>
          } @else if (type() === 'info') {
          <div class="relative">
            <svg
              class="w-7 h-7 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            <div
              class="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping"
            ></div>
          </div>
          } @else {
          <div class="relative">
            <svg
              class="w-7 h-7 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <div
              class="absolute inset-0 rounded-full bg-amber-400 opacity-25 animate-ping"
            ></div>
          </div>
          }
        </div>

        <!-- Content con tipografía mejorada -->
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-semibold text-gray-900 leading-tight">
            {{ title() }}
          </h4>
          <p class="mt-1.5 text-sm text-gray-600 leading-relaxed">
            {{ message() }}
          </p>
        </div>

        <!-- Close button con hover mejorado -->
        <button
          (click)="close()"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class Toast {
  // Inputs
  type = input<ToastType>('info');
  title = input<string>('');
  message = input<string>('');
  duration = input<number>(5000); // 5 segundos por defecto

  // Outputs
  closed = output<void>();

  // State
  isVisible = signal(false);

  ngOnInit() {
    // Mostrar toast con pequeño delay para animación suave
    setTimeout(() => {
      this.isVisible.set(true);
    }, 50);

    // Auto cerrar después del duration
    if (this.duration() > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration());
    }
  }

  close() {
    this.isVisible.set(false);
    // Esperar a que termine la animación antes de emitir el evento
    setTimeout(() => {
      this.closed.emit();
    }, 500); // Coincide con la duración de la animación CSS
  }
}
