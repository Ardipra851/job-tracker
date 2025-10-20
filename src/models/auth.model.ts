export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse extends User {
  token?: string;
  refreshToken?: string;
}

export interface Register {
  name: string;
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: number;
}

export function toAuthResponse(user: AuthResponse): AuthResponse {
  return {
    ...user,
  };
}
