export interface Docente {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  genero: string;
  is_doc: boolean;
  contrasena?: string;
  id?: number;
}