import { Nivel, Paralelo, Turno } from "../../../admin/cursos/interfaces/curso.interface";

export interface Materia {
  curso_id:            number;
  curso_nombre:        string;
  curso_nivel:         Nivel;
  curso_paralelo:      Paralelo;
  curso_turno:         Turno;
  materia_id:          number;
  materia_nombre:      string;
  materia_descripcion: string;
}



