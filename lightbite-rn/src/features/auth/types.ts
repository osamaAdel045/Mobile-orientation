export type UserRole = 'customer' | 'driver';

export interface User {
  uuid: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  phone?: string;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  phone: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
