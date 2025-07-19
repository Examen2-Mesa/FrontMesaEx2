import { Curso } from "../../../admin/cursos/interfaces/curso.interface";
import { Estudiante } from "../../../admin/estudiantes/interfaces/estudiante.interface";
import { Materia } from "../../../admin/materias/interfaces/materia.interface";

export interface ListaEstudiantes {
  estudiante: Estudiante;
  curso:      Curso;
  materia:    Materia;
}




