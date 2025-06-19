// Modelo principal del usuario (basad// Contenido del body parseado del registro (estructura real de la API)
export interface RegisterResponseBody {
  message: string;
  usuario: {
    tenant_id: string;
    email: string;
    nombre: string; // Nombre completo
    telefono: string;
    role: 'user' | 'admin';
    fecha_creacion: string;
    activo: boolean;
  };
}

// Modelo principal del usuario (basado en la respuesta real de la API)
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: 'user' | 'admin';
  fechaCreacion: string;
}

// Request para registro de usuario (estructura para tu API)
export interface RegisterRequest {
  tenant_id: string; // Requerido por tu API
  nombre: string; // Nombre completo
  email: string;
  password: string;
  telefono?: string; // Opcional
}

// Request para login (estructura para tu API)
export interface LoginRequest {
  tenant_id: string; // Requerido por tu API
  email: string;
  password: string;
}

// Respuesta completa del API de login
export interface LoginResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
  };
  body: string; // JSON string que contiene LoginResponseBody
}

// Contenido del body parseado del login (estructura real de la API)
export interface LoginResponseBody {
  message: string;
  token: string;
  usuario: {
    tenant_id: string;
    email: string;
    nombre: string; // Nombre completo
    telefono: string;
    role: 'user' | 'admin';
  };
}

// Interfaz para datos del JWT decodificado (basado en el token real)
export interface JwtPayload {
  tenant_id: string;
  email: string;
  nombre: string; // Nombre completo en el JWT
  role: 'user' | 'admin';
  exp: number; // Timestamp de expiración
  iat: number; // Timestamp de emisión
}

// Respuesta completa del API de registro
export interface RegisterResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
  };
  body: string; // JSON string que contiene RegisterResponseBody
}

// Contenido del body parseado del registro (estructura real de la API)
export interface RegisterResponseBody {
  message: string;
  usuario: {
    tenant_id: string;
    email: string;
    nombre: string; // Nombre completo
    telefono: string;
    role: 'user' | 'admin';
    fecha_creacion: string;
    activo: boolean;
  };
  // Nota: NO incluye token, el usuario debe hacer login después del registro
}
