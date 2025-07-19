import { Curso } from "../../cursos/interfaces/curso.interface";
import { Materia } from "../../materias/interfaces/materia.interface";

export interface CursoMateria {
  curso_id: number;
  materia_id: number;
  id: number;
}

export interface CursoMateriaDetalle {
  id:      number;
  curso:   Curso;
  materia: Materia;
}

