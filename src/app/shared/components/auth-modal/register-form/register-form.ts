import { Component, output, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RegisterRequest } from '../../../models/user.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-form.html',
})
export class RegisterForm {
  // Output para notificar registro exitoso con el email
  registerSuccess = output<string>(); // Ahora emite el email

  // Inyecciones
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Signals para el estado
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Formulario reactivo
  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group(
      {
        nombres: ['', [Validators.required, Validators.minLength(2)]],
        apellidos: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.pattern(/^\+?[1-9]\d{8,14}$/)], // Opcional ahora
        ],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  // Toggle visibilidad de passwords
  togglePasswordVisibility() {
    this.showPassword.update((show) => !show);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update((show) => !show);
  }

  // Submit del formulario
  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { nombres, apellidos, email, telefono, password } =
        this.registerForm.value;

      // Combinar nombres y apellidos en un solo campo
      const nombreCompleto = `${nombres} ${apellidos}`.trim();

      const registerRequest: RegisterRequest = {
        tenant_id: 'inkafarma', // Hardcoded por ahora
        nombre: nombreCompleto,
        email,
        password,
        ...(telefono && { telefono }), // Solo incluir teléfono si tiene valor
      };

      this.authService.register(registerRequest).subscribe({
        next: (message: string) => {
          console.log('Registration successful:', message);
          this.isLoading.set(false);

          // Mostrar toast de éxito moderno
          this.toastService.showSuccess(
            '¡Registro exitoso!',
            'Tu cuenta ha sido creada correctamente. Serás redirigido al login automáticamente.',
            4000
          );

          this.registerSuccess.emit(email);
        },
        error: (errorMessage: string) => {
          console.error('Registration failed:', errorMessage);
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
    Object.keys(this.registerForm.controls).forEach((key) => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required'])
        return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato de teléfono inválido';
      if (field.errors['passwordMismatch'])
        return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombres: 'Nombres',
      apellidos: 'Apellidos',
      email: 'Email',
      telefono: 'Teléfono',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
    };
    return labels[fieldName] || fieldName;
  }
}
