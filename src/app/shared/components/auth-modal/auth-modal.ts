import { Component, signal, output } from '@angular/core';
import { LoginForm } from './login-form/login-form';
import { RegisterForm } from './register-form/register-form';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [LoginForm, RegisterForm],
  templateUrl: './auth-modal.html',
})
export class AuthModal {
  // Signal para controlar qué tab está activo: 'login' o 'register'
  activeTab = signal<'login' | 'register'>('login');

  // Signal para controlar la animación de cierre
  isClosing = signal(false);

  // Signal para almacenar el email del registro
  registeredEmail = signal<string>('');

  // Output para comunicar al padre que se quiere cerrar el modal
  close = output<void>();

  // Output para comunicar login exitoso
  loginSuccess = output<void>();

  // Cambiar entre tabs
  setActiveTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
  }

  // Cerrar modal con animación
  closeModal() {
    this.isClosing.set(true);
    // Esperar a que termine la animación antes de cerrar
    setTimeout(() => {
      this.close.emit();
    }, 200); // Duración de la animación de salida
  }

  // Prevenir que el click en el contenido cierre el modal
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Manejar login exitoso
  onLoginSuccess() {
    // Emitir primero, luego cerrar para evitar el warning
    this.loginSuccess.emit();
    // Usar setTimeout para evitar el warning de OutputRef destruido
    setTimeout(() => {
      this.closeModal();
    }, 0);
  }

  // Manejar registro exitoso
  onRegisterSuccess(email: string) {
    // Guardar el email para pre-llenar el login
    this.registeredEmail.set(email);

    // Cambiar a la pestaña de login después del registro exitoso
    setTimeout(() => {
      this.setActiveTab('login');
    }, 500); // Pequeño delay para que se vea el toast primero
  }
}
