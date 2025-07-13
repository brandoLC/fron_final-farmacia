import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay -->
    @if (cart.isVisible()) {
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
      (click)="cart.hideCart()"
    ></div>

    <!-- Sidebar del carrito -->
    <div
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Mi Carrito</h2>
            <p class="text-sm text-gray-600">
              {{ cart.totalItems() }} producto(s)
            </p>
          </div>
        </div>
        <button
          type="button"
          (click)="cart.hideCart()"
          class="p-2 hover:bg-green-100 rounded-lg transition-colors"
        >
          <svg
            class="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Contenido del carrito -->
      <div class="flex-1 overflow-y-auto">
        @if (cart.items().length === 0) {
        <!-- Carrito vacío -->
        <div
          class="flex flex-col items-center justify-center h-full p-8 text-center"
        >
          <div
            class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <svg
              class="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Tu carrito está vacío
          </h3>
          <p class="text-gray-600 mb-6">
            Agrega productos para comenzar tu compra
          </p>
          <button
            type="button"
            (click)="cart.hideCart()"
            class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
        } @else {
        <!-- Lista de productos -->
        <div class="p-4 space-y-4">
          @for (item of cart.items(); track item.producto.codigo) {
          <div class="flex items-start space-x-3 bg-gray-50 rounded-lg p-3">
            <!-- Imagen del producto -->
            <div
              class="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0"
            >
              <img
                [src]="item.producto.imagen_url"
                [alt]="item.producto.nombre"
                class="w-full h-full object-contain"
                onerror="this.src='https://via.placeholder.com/64x64?text=Sin+Imagen'"
              />
            </div>

            <!-- Información del producto -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                {{ item.producto.nombre }}
              </h4>
              <p class="text-xs text-gray-600 mb-2">
                {{ item.producto.laboratorio }}
              </p>

              <!-- Precio y controles -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-green-600">
                    S/{{ item.subtotal | number : '1.2-2' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    S/{{ item.precio_unitario | number : '1.2-2' }} c/u
                  </span>
                </div>

                <!-- Controles de cantidad -->
                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    (click)="updateQuantity(item, item.cantidad - 1)"
                    class="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    [disabled]="item.cantidad <= 1"
                  >
                    <svg
                      class="w-3 h-3 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>

                  <span class="text-sm font-medium w-8 text-center">{{
                    item.cantidad
                  }}</span>

                  <button
                    type="button"
                    (click)="updateQuantity(item, item.cantidad + 1)"
                    class="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    [disabled]="item.cantidad >= item.producto.stock_disponible"
                  >
                    <svg
                      class="w-3 h-3 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v12m6-6H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Botón eliminar -->
              <button
                type="button"
                (click)="removeItem(item)"
                class="text-red-600 hover:text-red-700 text-xs font-medium mt-2 flex items-center space-x-1"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
          }
        </div>
        }
      </div>

      <!-- Footer con totales y botón de checkout -->
      @if (cart.items().length > 0) {
      <div class="border-t border-gray-200 p-4 space-y-4 bg-white">
        <!-- Resumen de precios -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal:</span>
            <span class="font-medium"
              >S/{{ cart.subtotal() | number : '1.2-2' }}</span
            >
          </div>

          @if (cart.descuentos() > 0) {
          <div class="flex justify-between text-sm text-green-600">
            <span>Descuentos:</span>
            <span>-S/{{ cart.descuentos() | number : '1.2-2' }}</span>
          </div>
          }

          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Envío:</span>
            <span class="font-medium">
              @if (cart.envio() === 0) {
              <span class="text-green-600">Gratis</span>
              } @else {
              <span>S/{{ cart.envio() | number : '1.2-2' }}</span>
              }
            </span>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-600">IGV (18%):</span>
            <span class="font-medium"
              >S/{{ cart.impuestos() | number : '1.2-2' }}</span
            >
          </div>

          <div class="border-t border-gray-200 pt-2">
            <div class="flex justify-between">
              <span class="text-lg font-bold text-gray-900">Total:</span>
              <span class="text-lg font-bold text-green-600"
                >S/{{ cart.total() | number : '1.2-2' }}</span
              >
            </div>
          </div>
        </div>

        <!-- Mensaje de envío gratis -->
        @if (cart.subtotal() < 50) {
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-xs text-blue-700">
            <span class="font-medium">¡Envío gratis</span> agregando S/{{
              50 - cart.subtotal() | number : '1.2-2'
            }}
            más!
          </p>
        </div>
        }

        <!-- Botones de acción -->
        <div class="space-y-3">
          <button
            type="button"
            (click)="goToCheckout()"
            [disabled]="cart.isLoading()"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            @if (cart.isLoading()) {
            <div
              class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            ></div>
            <span>Procesando...</span>
            } @else {
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Finalizar Compra</span>
            }
          </button>

          <button
            type="button"
            (click)="cart.hideCart()"
            class="w-full border-2 border-green-600 text-green-600 py-2.5 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
      }
    </div>
    }
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class CartSidebarComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  // Exponer el servicio para el template
  get cart() {
    return this.cartService;
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    try {
      this.cartService.updateQuantity(item.producto.codigo, newQuantity);
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      // Aquí podrías mostrar un toast de error
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.producto.codigo);
  }

  goToCheckout(): void {
    this.cartService.hideCart();
    this.router.navigate(['/checkout']);
  }
}
