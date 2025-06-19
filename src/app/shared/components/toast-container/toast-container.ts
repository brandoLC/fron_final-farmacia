import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '../toast/toast';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, Toast],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      @for (toast of toastService.toasts(); track toast.id; let i = $index) {
      <div
        class="transform transition-all duration-300 ease-out"
        [style.transform]="'translateY(' + i * 4 + 'px)'"
      >
        <app-toast
          [type]="toast.type"
          [title]="toast.title"
          [message]="toast.message"
          [duration]="0"
          (closed)="removeToast(toast.id)"
        />
      </div>
      }
    </div>
  `,
})
export class ToastContainer {
  toastService = inject(ToastService);

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }
}
