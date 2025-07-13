import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
              <p class="text-gray-600 mt-2">Historial de todas tus compras</p>
            </div>
            <button
              routerLink="/"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Volver al inicio
            </button>
          </div>
        </div>

        @if (orderService.isLoading()) {
        <!-- Loading State -->
        <div class="space-y-4">
          @for (item of [1,2,3]; track item) {
          <div class="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div class="flex items-start justify-between mb-4">
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded w-48"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          }
        </div>
        } @else if (orderService.orders().length === 0) {
        <!-- Empty State -->
        <div class="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-gray-400"
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
            No tienes pedidos aún
          </h3>
          <p class="text-gray-600 mb-6">
            Cuando realices tu primera compra, aparecerá aquí
          </p>
          <button
            routerLink="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Comenzar a comprar
          </button>
        </div>
        } @else {
        <!-- Orders List -->
        <div class="space-y-6">
          @for (order of orderService.orders(); track order.codigo_compra) {
          <div
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
          >
            <!-- Order Header -->
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <div class="flex items-center space-x-3">
                    <h3 class="text-lg font-semibold text-gray-900">
                      Pedido #{{ order.codigo_compra }}
                    </h3>
                    <span
                      [class]="orderService.getEstadoBadgeColor(order.estado)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ orderService.getEstadoText(order.estado) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ orderService.formatearFecha(order.fecha_compra) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-green-600">
                    S/ {{ order.total_monto.toFixed(2) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ order.total_productos }}
                    {{ order.total_productos === 1 ? 'producto' : 'productos' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="p-6">
              <!-- Products -->
              <div class="mb-6">
                <h4 class="font-medium text-gray-900 mb-3">Productos</h4>
                <div class="space-y-3">
                  @for (producto of order.productos; track producto.codigo) {
                  <div
                    class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900">
                        {{ producto.nombre }}
                      </h5>
                      <p class="text-sm text-gray-600">
                        Código: {{ producto.codigo }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900">
                        {{ producto.cantidad }} x S/
                        {{ producto.precio.toFixed(2) }}
                      </p>
                      <p class="text-sm text-gray-600">
                        Subtotal: S/ {{ producto.subtotal.toFixed(2) }}
                      </p>
                    </div>
                  </div>
                  }
                </div>
              </div>

              <!-- Order Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Delivery Info -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">
                    Información de Entrega
                  </h4>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="space-y-2">
                      <div>
                        <span class="text-sm font-medium text-gray-700"
                          >Dirección:</span
                        >
                        <p class="text-sm text-gray-900">
                          {{ order.direccion_entrega }}
                        </p>
                      </div>
                      @if (order.observaciones) {
                      <div>
                        <span class="text-sm font-medium text-gray-700"
                          >Observaciones:</span
                        >
                        <p class="text-sm text-gray-900">
                          {{ order.observaciones }}
                        </p>
                      </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Payment Info -->
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">
                    Información de Pago
                  </h4>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        @switch (order.metodo_pago) { @case ('tarjeta') {
                        <svg
                          class="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span class="text-sm font-medium text-gray-900"
                          >Tarjeta de Crédito/Débito</span
                        >
                        } @case ('efectivo') {
                        <svg
                          class="w-5 h-5 text-green-600"
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
                        <span class="text-sm font-medium text-gray-900"
                          >Efectivo</span
                        >
                        } @case ('transferencia') {
                        <svg
                          class="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H21l-3 6H6l-3-6h7.5z"
                          />
                        </svg>
                        <span class="text-sm font-medium text-gray-900"
                          >Transferencia Bancaria</span
                        >
                        } @default {
                        <span
                          class="text-sm font-medium text-gray-900 capitalize"
                          >{{ order.metodo_pago }}</span
                        >
                        } }
                      </div>
                      <div>
                        <span class="text-sm font-medium text-gray-700"
                          >Total:</span
                        >
                        <span class="text-sm font-bold text-green-600 ml-2"
                          >S/ {{ order.total_monto.toFixed(2) }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <div
                    class="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{{ order.nombre_usuario }}</span>
                    <span>•</span>
                    <span>{{ order.email_usuario }}</span>
                  </div>

                  <div class="flex items-center space-x-3">
                    @if (order.estado === 'completada') {
                    <button
                      (click)="reorderItems(order)"
                      class="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Volver a pedir
                    </button>
                    }

                    <button
                      (click)="viewOrderDetail(order.codigo_compra)"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Load More Button -->
        @if (hasMore()) {
        <div class="text-center mt-8">
          <button
            (click)="loadMore()"
            [disabled]="orderService.isLoading()"
            class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (orderService.isLoading()) {
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Cargando... } @else { Cargar más pedidos }
          </button>
        </div>
        } }
      </div>
    </div>
  `,
})
export class OrderHistoryComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  readonly orderService = inject(OrderService);

  // Estado local
  private lastNextKey = signal<string | undefined>(undefined);
  readonly hasMore = signal<boolean>(false);

  ngOnInit() {
    // Debug: verificar el estado de autenticación
    console.log('OrderHistory - Estado de autenticación:', {
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.currentUser(),
      isLoading: this.authService.isLoading(),
    });

    // Esperar un momento para que el AuthService valide el token si es necesario
    setTimeout(() => {
      // Verificar autenticación después del timeout
      if (!this.authService.isAuthenticated()) {
        console.log(
          'OrderHistory - Usuario no autenticado después del timeout, redirigiendo...'
        );
        this.toastService.showError(
          'Error',
          'Debes iniciar sesión para ver tus pedidos'
        );
        this.router.navigate(['/']);
        return;
      }

      console.log('OrderHistory - Usuario autenticado, cargando pedidos...');
      this.loadOrders();
    }, 100); // Esperar 100ms para que el AuthService termine de validar
  }

  /**
   * Carga los pedidos del usuario
   */
  loadOrders() {
    this.orderService.listarCompras().subscribe({
      next: (response) => {
        this.hasMore.set(response.hasMore);
        this.lastNextKey.set(response.nextKey);
      },
      error: (error) => {
        this.toastService.showError('Error', error);
      },
    });
  }

  /**
   * Carga más pedidos (paginación)
   */
  loadMore() {
    const nextKey = this.lastNextKey();
    if (!nextKey) return;

    this.orderService.listarCompras(20, nextKey).subscribe({
      next: (response) => {
        this.hasMore.set(response.hasMore);
        this.lastNextKey.set(response.nextKey);
      },
      error: (error) => {
        this.toastService.showError('Error', error);
      },
    });
  }

  /**
   * Ver detalle de un pedido específico
   */
  viewOrderDetail(codigoCompra: string) {
    this.router.navigate(['/orders', codigoCompra]);
  }

  /**
   * Volver a pedir los mismos productos
   */
  reorderItems(order: Order) {
    // Esta funcionalidad requeriría agregar los productos al carrito
    // Por ahora mostraremos un mensaje
    this.toastService.showInfo(
      'Funcionalidad próximamente',
      'La opción de volver a pedir estará disponible pronto'
    );
  }
}
