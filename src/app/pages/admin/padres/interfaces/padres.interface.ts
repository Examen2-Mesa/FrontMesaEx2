// ==============================
// Padre (respuesta y creación)
// ==============================

export interface Padre {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  genero: string;
}

// Al crear un padre
export interface PadreCreate {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  genero: string;
  contrasena: string;
  hijos_ids?: number[];  // hijos opcionales en creación
}

// Actualizar un padre
export interface PadreUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  genero?: string;
  contrasena?: string;
}

// ==============================
// Estudiante (básico para hijos)
// ==============================

export interface Estudiantes {
  id: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: string;
}

// ==============================
// Padre con hijos
// ==============================

export interface PadreConHijos extends Padre {
  hijos: Estudiantes[];
}
