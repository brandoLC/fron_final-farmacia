import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PublicNavigation } from '../../navigation/public-navigation/public-navigation';
import { AdminNavigation } from '../../navigation/admin-navigation/admin-navigation';

@Component({
  selector: 'app-header-navigation',
  standalone: true,
  imports: [CommonModule, PublicNavigation, AdminNavigation],
  templateUrl: './header-navigation.html',
})
export class HeaderNavigation {
  private authService = inject(AuthService);

  // Usar los signals del AuthService directamente
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;
}
