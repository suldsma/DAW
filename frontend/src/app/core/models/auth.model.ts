export interface LoginDto {
  nombre: string;
  clave: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface UserTokenPayload {
  sub: number;
  nombre: string;
  estado: string;
  exp: number;
}