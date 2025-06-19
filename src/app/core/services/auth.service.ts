import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map, tap } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  JwtPayload,
} from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // API Base URL - URL real de tu API Gateway
  private readonly API_BASE_URL =
    'https://5iuiele0nf.execute-api.us-east-1.amazonaws.com/dev';

  // Modo de desarrollo - ahora usando API real
  private readonly DEV_MODE = false;

  // Token key para localStorage
  private readonly TOKEN_KEY = 'farmacia_auth_token';

  // Signals para el estado de autenticación
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isAuthenticated = signal<boolean>(false);

  // Computed signals públicos
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly isAdmin = computed(
    () => this._currentUser()?.rol === 'admin'
  );

  constructor() {
    // Validar token al inicializar el servicio
    this.validateTokenOnInit();
  }

  /**
   * Valida el token almacenado al iniciar la aplicación
   */
  private validateTokenOnInit(): void {
    const token = this.getStoredToken();
    if (token) {
      this._isLoading.set(true);
      this.validateToken().subscribe({
        next: (user) => {
          this._currentUser.set(user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        },
        error: () => {
          // Token inválido, limpiar localStorage
          this.clearAuthData();
          this._isLoading.set(false);
        },
      });
    }
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<User> {
    this._isLoading.set(true);

    // Usar mock en modo desarrollo
    if (this.DEV_MODE) {
      return this.mockLogin(credentials);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<LoginResponse>(`${this.API_BASE_URL}/usuarios/login`, credentials, {
        headers,
      })
      .pipe(
        map((response) => {
          // Parsear el body que viene como string JSON
          const body =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body;
          return { ...response, body };
        }),
        tap((response) => {
          // Guardar token y actualizar estado
          this.storeToken(response.body.token);

          // Extraer datos del usuario de la respuesta
          const usuario = response.body.usuario;

          // Dividir el nombre completo en nombres y apellidos
          const nombreCompleto = usuario.nombre || '';
          const partesNombre = nombreCompleto.split(' ');
          const nombres = partesNombre
            .slice(0, Math.ceil(partesNombre.length / 2))
            .join(' ');
          const apellidos = partesNombre
            .slice(Math.ceil(partesNombre.length / 2))
            .join(' ');

          const user: User = {
            id: usuario.tenant_id + '_' + usuario.email, // Crear ID único
            nombres: nombres || 'Usuario',
            apellidos: apellidos || '',
            email: usuario.email,
            rol: usuario.role as 'user' | 'admin',
            fechaCreacion: new Date().toISOString(), // No disponible en la respuesta
          };
          this._currentUser.set(user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        }),
        map((response) => {
          // Extraer datos del usuario de la respuesta para retornarlo
          const usuario = response.body.usuario;

          // Dividir el nombre completo en nombres y apellidos
          const nombreCompleto = usuario.nombre || '';
          const partesNombre = nombreCompleto.split(' ');
          const nombres = partesNombre
            .slice(0, Math.ceil(partesNombre.length / 2))
            .join(' ');
          const apellidos = partesNombre
            .slice(Math.ceil(partesNombre.length / 2))
            .join(' ');

          return {
            id: usuario.tenant_id + '_' + usuario.email,
            nombres: nombres || 'Usuario',
            apellidos: apellidos || '',
            email: usuario.email,
            rol: usuario.role as 'user' | 'admin',
            fechaCreacion: new Date().toISOString(),
          };
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  /**
   * Realiza el registro de un nuevo usuario (sin login automático)
   */
  register(userData: RegisterRequest): Observable<string> {
    this._isLoading.set(true);

    // Usar mock en modo desarrollo
    if (this.DEV_MODE) {
      return this.mockRegister(userData);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<RegisterResponse>(`${this.API_BASE_URL}/usuarios/crear`, userData, {
        headers,
      })
      .pipe(
        map((response) => {
          // Parsear el body que viene como string JSON
          const body =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body;

          // Solo devolver el mensaje de éxito, sin loguear automáticamente
          this._isLoading.set(false);
          return body.message; // "Usuario creado exitosamente"
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  /**
   * Valida el token actual con la API
   */
  validateToken(): Observable<User> {
    const token = this.getStoredToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    // Usar mock en modo desarrollo
    if (this.DEV_MODE) {
      return this.mockValidateToken();
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${this.API_BASE_URL}/usuarios/validar`, {}, { headers })
      .pipe(
        map((response) => {
          // Manejar la respuesta completa con statusCode, headers, body
          if (response.statusCode === 200) {
            // Parsear el body que viene como string JSON
            const body =
              typeof response.body === 'string'
                ? JSON.parse(response.body)
                : response.body;

            if (body.valid && body.usuario) {
              const usuario = body.usuario;
              // Extraer nombres y apellidos del campo "nombre"
              const nombreCompleto = usuario.nombre || '';
              const partesNombre = nombreCompleto.split(' ');
              const nombres = partesNombre
                .slice(0, Math.ceil(partesNombre.length / 2))
                .join(' ');
              const apellidos = partesNombre
                .slice(Math.ceil(partesNombre.length / 2))
                .join(' ');

              return {
                id: usuario.tenant_id + '_' + usuario.email, // Generar ID único
                nombres: nombres || 'Usuario',
                apellidos: apellidos || '',
                email: usuario.email,
                rol: usuario.role as 'user' | 'admin',
                fechaCreacion: new Date().toISOString(), // No disponible en la respuesta
              };
            } else {
              throw new Error('Token validation failed');
            }
          } else {
            throw new Error('Token validation failed');
          }
        }),
        catchError((error) => {
          // Token inválido, limpiar datos
          this.clearAuthData();
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Obtiene el token JWT almacenado
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Decodifica el payload del JWT (sin validar la firma)
   */
  decodeToken(token?: string): JwtPayload | null {
    const currentToken = token || this.getStoredToken();
    if (!currentToken) return null;

    try {
      const parts = currentToken.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(token?: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Almacena el token en localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token de localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Limpia todos los datos de autenticación
   */
  private clearAuthData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._isLoading.set(false);
  }

  /**
   * Maneja los errores de autenticación
   */
  private handleAuthError(error: any): string {
    console.error('Authentication error:', error);

    if (error.status === 401) {
      return 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
    } else if (error.status === 403) {
      return 'Acceso denegado. No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      return 'Servicio no encontrado. Por favor, intenta más tarde.';
    } else if (error.status === 409) {
      return 'El email ya está registrado. Por favor, usa otro email.';
    } else if (error.status === 422) {
      return 'Datos inválidos. Por favor, verifica la información ingresada.';
    } else if (error.status === 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    } else if (error.status === 0 || !error.status) {
      return 'Error de conexión. Por favor, verifica tu conexión a internet.';
    }

    return (
      error.message ||
      'Ha ocurrido un error inesperado. Por favor, intenta más tarde.'
    );
  }

  /**
   * MÉTODOS MOCK PARA DESARROLLO
   */
  private mockLogin(credentials: LoginRequest): Observable<User> {
    return new Observable((subscriber) => {
      setTimeout(() => {
        // Simular diferentes usuarios según el email
        let user: User;
        if (credentials.email === 'admin@farmacia.com') {
          user = {
            id: '1',
            nombres: 'Admin',
            apellidos: 'Farmacia',
            email: credentials.email,
            rol: 'admin',
            fechaCreacion: new Date().toISOString(),
          };
        } else {
          user = {
            id: '2',
            nombres: 'Usuario',
            apellidos: 'Prueba',
            email: credentials.email,
            rol: 'user',
            fechaCreacion: new Date().toISOString(),
          };
        }

        // Simular token JWT
        const mockToken = 'mock-jwt-token-' + Date.now();
        this.storeToken(mockToken);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
        this._isLoading.set(false);

        subscriber.next(user);
        subscriber.complete();
      }, 1500); // Simular latencia de red
    });
  }

  private mockRegister(userData: RegisterRequest): Observable<string> {
    return new Observable((subscriber) => {
      setTimeout(() => {
        // Solo devolver mensaje de éxito, sin loguear automáticamente
        this._isLoading.set(false);
        subscriber.next(
          'Usuario registrado exitosamente. Ahora puedes iniciar sesión.'
        );
        subscriber.complete();
      }, 1500); // Simular latencia de red
    });
  }

  private mockValidateToken(): Observable<User> {
    return new Observable((subscriber) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '2',
          nombres: 'Usuario',
          apellidos: 'Guardado',
          email: 'usuario@farmacia.com',
          rol: 'user',
          fechaCreacion: new Date().toISOString(),
        };

        subscriber.next(mockUser);
        subscriber.complete();
      }, 800);
    });
  }
}
