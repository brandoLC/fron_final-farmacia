import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // Signal para almacenar los toasts activos
  toasts = signal<ToastMessage[]>([]);

  // Método para mostrar un toast de éxito
  showSuccess(title: string, message: string, duration: number = 5000) {
    this.addToast('success', title, message, duration);
  }

  // Método para mostrar un toast de error
  showError(title: string, message: string, duration: number = 6000) {
    this.addToast('error', title, message, duration);
  }

  // Método para mostrar un toast de información
  showInfo(title: string, message: string, duration: number = 5000) {
    this.addToast('info', title, message, duration);
  }

  // Método para mostrar un toast de advertencia
  showWarning(title: string, message: string, duration: number = 5000) {
    this.addToast('warning', title, message, duration);
  }

  // Método privado para agregar un toast
  private addToast(
    type: ToastMessage['type'],
    title: string,
    message: string,
    duration: number
  ) {
    const id = this.generateId();
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };

    // Agregar el toast a la lista
    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto-remover después del duration (si es mayor a 0)
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  // Método para remover un toast específico
  removeToast(id: string) {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  // Método para limpiar todos los toasts
  clearAll() {
    this.toasts.set([]);
  }

  // Generar ID único para cada toast
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
