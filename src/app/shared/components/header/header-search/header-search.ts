import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthModal } from '../../auth-modal/auth-modal';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import {
  ProductService,
  SearchResponse,
  Product,
} from '../../../../core/services/product.service';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Subject, EMPTY } from 'rxjs';

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [AuthModal, CommonModule, FormsModule, RouterModule],
  templateUrl: './header-search.html',
})
export class HeaderSearch {
  // Inyección de servicios
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private router = inject(Router);

  // Signal para controlar la visibilidad del modal
  showAuthModal = signal(false);

  // Signals para búsqueda
  searchTerm = signal('');
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  showSearchDropdown = signal(false);
  showCartDropdown = signal(false);
  searchSubject = new Subject<string>();

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

  constructor() {
    // Configurar búsqueda con debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 2) {
            this.searchResults.set([]);
            this.showSearchDropdown.set(false);
            return EMPTY;
          }

          this.isSearching.set(true);
          return this.productService.buscarProductos(term, 5);
        }),
        tap(() => this.isSearching.set(false))
      )
      .subscribe({
        next: (response: SearchResponse) => {
          this.searchResults.set(response.productos);
          this.showSearchDropdown.set(response.productos.length > 0);
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.searchResults.set([]);
          this.showSearchDropdown.set(false);
          this.isSearching.set(false);
        },
      });
  }

  // Métodos de búsqueda
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();
    this.searchTerm.set(value);
    this.searchSubject.next(value);
    // Cerrar dropdown del carrito si se está escribiendo en búsqueda
    if (this.showCartDropdown()) {
      this.hideCartDropdown();
    }
  }

  onSearchSubmit() {
    const term = this.searchTerm().trim();
    if (term) {
      this.hideSearchDropdown();
      this.router.navigate(['/search'], { queryParams: { q: term } });
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchSubmit();
    } else if (event.key === 'Escape') {
      this.hideSearchDropdown();
    }
  }

  selectProduct(product: Product) {
    this.hideSearchDropdown();
    const searchTerm = this.searchTerm().trim();
    // Pasar el término de búsqueda como query param para mantener contexto
    this.router.navigate(['/product', product.codigo], {
      queryParams: searchTerm ? { search: searchTerm } : {},
    });
  }

  hideSearchDropdown() {
    this.showSearchDropdown.set(false);
  }

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
    // No hacer nada más aquí - la redirección se maneja automáticamente en el AuthService
  }

  // Alternar visibilidad del carrito (sidebar)
  toggleCart() {
    this.cartService.toggleCart();
  }

  // Métodos para el dropdown del carrito
  toggleCartDropdown() {
    this.showCartDropdown.update((show) => !show);
    // Si se abre el dropdown del carrito, cerrar el de búsqueda
    if (this.showCartDropdown()) {
      this.hideSearchDropdown();
    }
  }

  hideCartDropdown() {
    this.showCartDropdown.set(false);
  }

  // Navegar al checkout
  goToCheckout() {
    this.hideCartDropdown();
    this.router.navigate(['/checkout']);
  }

  // Ver carrito completo (abrir sidebar)
  viewFullCart() {
    this.hideCartDropdown();
    this.cartService.showCart();
  }

  // Manejar errores de imagen
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/48x48?text=Sin+Imagen';
  }

  // Navegar a mis pedidos
  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
