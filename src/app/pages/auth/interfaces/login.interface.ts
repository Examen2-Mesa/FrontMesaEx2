export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  is_doc: boolean;
}
