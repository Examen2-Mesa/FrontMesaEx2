export interface Estudiante {
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  genero: string;
  nombre_tutor: string;
  telefono_tutor: string;
  direccion_casa: string;
  url_imagen?: string;
  id?: number;
  nombreCompleto?: string; // Propiedad opcional para el ng-select
}


