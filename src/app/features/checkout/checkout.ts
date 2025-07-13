import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, MetodoPago } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header del Checkout -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Finalizar Compra
          </h1>
          <p class="text-gray-600">
            Completa los datos para procesar tu pedido
          </p>
        </div>

        <!-- Stepper -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            @for (step of steps(); track step.id) {
            <div class="flex items-center">
              <div class="flex items-center">
                <div
                  [class]="
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.active
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  "
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  @if (step.completed) {
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  } @else {
                  {{ $index + 1 }}
                  }
                </div>
                <span
                  [class]="
                    step.active ? 'text-blue-600 font-medium' : 'text-gray-500'
                  "
                  class="ml-3 text-sm hidden sm:block"
                >
                  {{ step.title }}
                </span>
              </div>
              @if (!$last) {
              <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              }
            </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Formulario de Checkout -->
          <div class="lg:col-span-2">
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              <!-- Paso 1: Información de Entrega -->
              @if (currentStep() === 'delivery') {
              <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">
                  Información de Entrega
                </h2>

                <div class="space-y-4">
                  <!-- Dirección de Entrega -->
                  <div>
                    <label
                      for="direccion"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Dirección de Entrega *
                    </label>
                    <textarea
                      id="direccion"
                      formControlName="direccion_entrega"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingresa la dirección completa de entrega"
                    >
                    </textarea>
                    @if (checkoutForm.get('direccion_entrega')?.invalid &&
                    checkoutForm.get('direccion_entrega')?.touched) {
                    <p class="mt-1 text-sm text-red-600">
                      La dirección de entrega es obligatoria
                    </p>
                    }
                  </div>

                  <!-- Observaciones -->
                  <div>
                    <label
                      for="observaciones"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      id="observaciones"
                      formControlName="observaciones"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Instrucciones especiales para la entrega"
                    >
                    </textarea>
                  </div>
                </div>
              </div>
              }

              <!-- Paso 2: Método de Pago -->
              @if (currentStep() === 'payment') {
              <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">
                  Método de Pago
                </h2>

                <div class="space-y-3">
                  @for (metodo of cartService.metodosPago; track metodo.id) {
                  @if (metodo.activo) {
                  <label
                    class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      [value]="metodo.id"
                      formControlName="metodo_pago"
                      class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <!-- Icono del método de pago -->
                        @switch (metodo.icono) { @case ('credit-card') {
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
                          ></path>
                        </svg>
                        } @case ('cash') {
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
                          ></path>
                        </svg>
                        } @case ('bank') {
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
                          ></path>
                        </svg>
                        } @default {
                        <div class="w-5 h-5 bg-gray-300 rounded"></div>
                        } }
                        <span class="font-medium text-gray-900">{{
                          metodo.nombre
                        }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ metodo.descripcion }}
                      </p>
                    </div>
                  </label>
                  } }
                </div>

                @if (checkoutForm.get('metodo_pago')?.invalid &&
                checkoutForm.get('metodo_pago')?.touched) {
                <p class="mt-2 text-sm text-red-600">
                  Selecciona un método de pago
                </p>
                }
              </div>
              }

              <!-- Paso 3: Confirmación -->
              @if (currentStep() === 'confirmation') {
              <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">
                  Confirmar Pedido
                </h2>

                <!-- Resumen de entrega -->
                <div class="mb-6">
                  <h3 class="font-medium text-gray-900 mb-2">
                    Información de Entrega
                  </h3>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-700">
                      <strong>Dirección:</strong><br />
                      {{ checkoutForm.get('direccion_entrega')?.value }}
                    </p>
                    @if (checkoutForm.get('observaciones')?.value) {
                    <p class="text-sm text-gray-700 mt-2">
                      <strong>Observaciones:</strong><br />
                      {{ checkoutForm.get('observaciones')?.value }}
                    </p>
                    }
                  </div>
                </div>

                <!-- Método de pago seleccionado -->
                <div class="mb-6">
                  <h3 class="font-medium text-gray-900 mb-2">Método de Pago</h3>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    @for (metodo of cartService.metodosPago; track metodo.id) {
                    @if (metodo.id === checkoutForm.get('metodo_pago')?.value) {
                    <div class="flex items-center space-x-2">
                      @switch (metodo.icono) { @case ('credit-card') {
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
                        ></path>
                      </svg>
                      } @case ('cash') {
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
                        ></path>
                      </svg>
                      } @case ('bank') {
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
                        ></path>
                      </svg>
                      } }
                      <span class="font-medium text-gray-900">{{
                        metodo.nombre
                      }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ metodo.descripcion }}
                    </p>
                    } }
                  </div>
                </div>
              </div>
              }

              <!-- Botones de navegación -->
              <div class="flex justify-between">
                @if (currentStep() !== 'delivery') {
                <button
                  type="button"
                  (click)="previousStep()"
                  class="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anterior
                </button>
                } @else {
                <div></div>
                } @if (currentStep() !== 'confirmation') {
                <button
                  type="button"
                  (click)="nextStep()"
                  [disabled]="!isCurrentStepValid()"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
                } @else {
                <button
                  type="submit"
                  [disabled]="cartService.isLoading() || !checkoutForm.valid"
                  class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  @if (cartService.isLoading()) {
                  <div class="flex items-center space-x-2">
                    <svg
                      class="animate-spin h-4 w-4"
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
                    <span>Procesando...</span>
                  </div>
                  } @else { Confirmar Pedido }
                </button>
                }
              </div>
            </form>
          </div>

          <!-- Resumen del Pedido -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              <!-- Items del carrito -->
              <div class="space-y-4 mb-6">
                @for (item of cartService.items(); track item.producto.codigo) {
                <div class="flex items-start space-x-3">
                  <img
                    [src]="item.producto.imagen_url"
                    [alt]="item.producto.nombre"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ item.producto.nombre }}
                    </h3>
                    <p class="text-xs text-gray-600">
                      {{ item.producto.laboratorio }}
                    </p>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-xs text-gray-500"
                        >Cant: {{ item.cantidad }}</span
                      >
                      <span class="text-sm font-medium text-gray-900">
                        S/ {{ item.subtotal.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
                }
              </div>

              <!-- Totales -->
              <div class="border-t pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="text-gray-900"
                    >S/ {{ cartService.subtotal().toFixed(2) }}</span
                  >
                </div>

                @if (cartService.descuentos() > 0) {
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Descuentos</span>
                  <span class="text-green-600"
                    >-S/ {{ cartService.descuentos().toFixed(2) }}</span
                  >
                </div>
                }

                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Impuestos (IGV)</span>
                  <span class="text-gray-900"
                    >S/ {{ cartService.impuestos().toFixed(2) }}</span
                  >
                </div>

                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Envío</span>
                  @if (cartService.envio() === 0) {
                  <span class="text-green-600">Gratis</span>
                  } @else {
                  <span class="text-gray-900"
                    >S/ {{ cartService.envio().toFixed(2) }}</span
                  >
                  }
                </div>

                <div class="border-t pt-2">
                  <div class="flex justify-between text-lg font-semibold">
                    <span class="text-gray-900">Total</span>
                    <span class="text-gray-900"
                      >S/ {{ cartService.total().toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Información de envío -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <div class="flex items-start space-x-2">
                  <svg
                    class="w-5 h-5 text-blue-600 mt-0.5"
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
                  <div>
                    <p class="text-sm font-medium text-blue-900">
                      Información de Envío
                    </p>
                    <p class="text-xs text-blue-700 mt-1">
                      @if (cartService.envio() === 0) { ¡Envío gratis por
                      compras mayores a S/ 50! } @else { Costo de envío: S/
                      {{ cartService.envio().toFixed(2) }}
                      }
                    </p>
                    <p class="text-xs text-blue-700">
                      Tiempo de entrega: 1-2 días hábiles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public readonly cartService = inject(CartService);
  public readonly authService = inject(AuthService);

  // Estados del componente
  private readonly _currentStep = signal<string>('delivery');
  private readonly _steps = signal<CheckoutStep[]>([
    { id: 'delivery', title: 'Entrega', completed: false, active: true },
    { id: 'payment', title: 'Pago', completed: false, active: false },
    {
      id: 'confirmation',
      title: 'Confirmación',
      completed: false,
      active: false,
    },
  ]);

  // Computed properties
  readonly currentStep = this._currentStep.asReadonly();
  readonly steps = this._steps.asReadonly();

  // Formulario reactivo
  checkoutForm: FormGroup;

  constructor() {
    this.checkoutForm = this.fb.group({
      direccion_entrega: ['', [Validators.required, Validators.minLength(10)]],
      observaciones: [''],
      metodo_pago: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.toastService.showError(
        'Error',
        'Debes iniciar sesión para realizar una compra'
      );
      this.router.navigate(['/']);
      return;
    }

    // Verificar que hay productos en el carrito
    if (this.cartService.totalItems() === 0) {
      this.toastService.showWarning('Carrito vacío', 'Tu carrito está vacío');
      this.router.navigate(['/']);
      return;
    }
  }

  /**
   * Navegar al siguiente paso
   */
  nextStep(): void {
    if (!this.isCurrentStepValid()) return;

    const currentStepIndex = this.getCurrentStepIndex();
    const steps = this._steps();

    if (currentStepIndex < steps.length - 1) {
      // Marcar paso actual como completado
      steps[currentStepIndex].completed = true;
      steps[currentStepIndex].active = false;

      // Activar siguiente paso
      steps[currentStepIndex + 1].active = true;

      this._steps.set([...steps]);

      // Cambiar paso actual
      const nextStepId = steps[currentStepIndex + 1].id;
      this._currentStep.set(nextStepId);
    }
  }

  /**
   * Navegar al paso anterior
   */
  previousStep(): void {
    const currentStepIndex = this.getCurrentStepIndex();
    const steps = this._steps();

    if (currentStepIndex > 0) {
      // Desactivar paso actual
      steps[currentStepIndex].active = false;
      steps[currentStepIndex].completed = false;

      // Activar paso anterior
      steps[currentStepIndex - 1].active = true;
      steps[currentStepIndex - 1].completed = false;

      this._steps.set([...steps]);

      // Cambiar paso actual
      const previousStepId = steps[currentStepIndex - 1].id;
      this._currentStep.set(previousStepId);
    }
  }

  /**
   * Verificar si el paso actual es válido
   */
  isCurrentStepValid(): boolean {
    const currentStep = this._currentStep();

    switch (currentStep) {
      case 'delivery':
        return this.checkoutForm.get('direccion_entrega')?.valid || false;
      case 'payment':
        return this.checkoutForm.get('metodo_pago')?.valid || false;
      case 'confirmation':
        return this.checkoutForm.valid;
      default:
        return false;
    }
  }

  /**
   * Obtener índice del paso actual
   */
  private getCurrentStepIndex(): number {
    const currentStep = this._currentStep();
    return this._steps().findIndex((step) => step.id === currentStep);
  }

  /**
   * Procesar compra
   */
  onSubmit(): void {
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    const formData = this.checkoutForm.value;

    this.cartService
      .registrarCompra(
        formData.metodo_pago,
        formData.direccion_entrega,
        formData.observaciones
      )
      .subscribe({
        next: (response) => {
          this.toastService.showSuccess(
            'Éxito',
            '¡Compra realizada exitosamente!'
          );
          this.router.navigate(['/checkout/success'], {
            queryParams: {
              orden_id: response.orden_id,
              total: response.total,
            },
          });
        },
        error: (error) => {
          this.toastService.showError('Error', error);
        },
      });
  }

  /**
   * Marcar todos los campos del formulario como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
