export interface User {
  id?: number;
  name: string;     // Cambié username por name para coincidir con tu backend
  email: string;
  password?: string;  // Solo para registro/login, no se almacena localmente
}

// Interfaces para las request de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Respuesta real del backend (formato plano)
export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  token: string;
  type: string; // "Bearer"
}
