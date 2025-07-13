import {
  Component,
  output,
  signal,
  inject,
  OnDestroy,
  input,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoginRequest } from '../../../models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.html',
})
export class LoginForm implements OnDestroy {
  // Input para recibir email pre-llenado
  prefilledEmail = input<string>('');

  // Output para notificar login exitoso
  loginSuccess = output<void>();

  // Inyecciones
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  // Signals para el estado
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  // Formulario reactivo
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Effect para actualizar el email cuando cambie el input
    effect(() => {
      const email = this.prefilledEmail();
      if (email) {
        this.loginForm.patchValue({ email });
        // También limpiar el password para mayor seguridad
        this.loginForm.patchValue({ password: '' });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toggle visibilidad de password
  togglePasswordVisibility() {
    this.showPassword.update((show) => !show);
  }

  // Submit del formulario
  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;
      const loginRequest: LoginRequest = {
        tenant_id: 'inkafarma', // Hardcoded por ahora
        email,
        password,
      };

      this.authService
        .login(loginRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            console.log('Login successful:', user);
            this.isLoading.set(false);

            // Mostrar toast de bienvenida
            this.toastService.showSuccess(
              '¡Bienvenido!',
              `Hola ${user.nombres}, has iniciado sesión correctamente.`,
              4000
            );

            // Emitir evento de login exitoso
            this.loginSuccess.emit();

            // Redirección automática basada en el rol del usuario
            this.authService.redirectAfterLogin(user);
          },
          error: (errorMessage: string) => {
            console.error('Login failed:', errorMessage);
            this.isLoading.set(false);
            this.errorMessage.set(errorMessage);
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Marcar todos los campos como touched para mostrar errores
  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
