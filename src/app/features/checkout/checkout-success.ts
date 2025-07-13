import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <!-- Icono de éxito -->
          <div
            class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6"
          >
            <svg
              class="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>

          <!-- Título y mensaje -->
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            ¡Compra Exitosa!
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            Tu pedido ha sido procesado correctamente
          </p>

          <!-- Información del pedido -->
          @if (ordenId() || total()) {
          <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Pedido
            </h2>

            @if (ordenId()) {
            <div
              class="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <span class="text-gray-600">Número de Orden:</span>
              <span class="font-mono text-gray-900 font-medium">{{
                ordenId()
              }}</span>
            </div>
            } @if (total()) {
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600">Total Pagado:</span>
              <span class="text-xl font-bold text-green-600"
                >S/ {{ total()?.toFixed(2) }}</span
              >
            </div>
            }
          </div>
          }

          <!-- Información adicional -->
          <div class="bg-blue-50 rounded-lg p-6 mb-8">
            <div class="flex items-start space-x-3">
              <svg
                class="w-6 h-6 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div class="text-left">
                <h3 class="text-sm font-medium text-blue-900 mb-2">
                  ¿Qué sigue?
                </h3>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Procesaremos tu pedido en las próximas horas</li>
                  <li>• Te enviaremos actualizaciones por email</li>
                  <li>• El tiempo de entrega es de 1-2 días hábiles</li>
                  <li>• Recibirás el pedido en la dirección indicada</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-4">
            <button
              routerLink="/"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continuar Comprando
            </button>

            <button
              routerLink="/orders"
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ver Mis Pedidos
            </button>
          </div>

          <!-- Contacto y soporte -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-500 mb-2">
              ¿Tienes alguna pregunta sobre tu pedido?
            </p>
            <div class="flex items-center justify-center space-x-6 text-sm">
              <a
                href="tel:+51-999-888-777"
                class="text-blue-600 hover:text-blue-500 flex items-center space-x-1"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <span>Llamar</span>
              </a>
              <a
                href="mailto:soporte@farmacia.com"
                class="text-blue-600 hover:text-blue-500 flex items-center space-x-1"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);

  // Signals para los datos del pedido
  readonly ordenId = signal<string | null>(null);
  readonly total = signal<number | null>(null);

  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      if (params['orden_id']) {
        this.ordenId.set(params['orden_id']);
      }
      if (params['total']) {
        this.total.set(parseFloat(params['total']));
      }
    });
  }
}
