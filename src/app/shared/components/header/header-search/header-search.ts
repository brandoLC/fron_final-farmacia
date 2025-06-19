import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModal } from '../../auth-modal/auth-modal';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [AuthModal, CommonModule],
  templateUrl: './header-search.html',
})
export class HeaderSearch {
  // Inyección del AuthService
  private authService = inject(AuthService);

  // Signal para controlar la visibilidad del modal
  showAuthModal = signal(false);

  // Computed signals basados en el AuthService
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isLoading = this.authService.isLoading;
  isAdmin = this.authService.isAdmin;

  // Computed para el nombre completo del usuario
  userName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.nombres} ${user.apellidos}` : '';
  });

  // Abrir modal de autenticación
  openAuthModal() {
    this.showAuthModal.set(true);
  }

  // Cerrar modal de autenticación
  closeAuthModal() {
    this.showAuthModal.set(false);
  }

  // Logout usando AuthService
  logout() {
    this.authService.logout();
  }

  // Manejar login/registro exitoso desde el modal
  onAuthSuccess() {
    this.closeAuthModal();
  }
}
