import { Materia } from "../../materias/interfaces/materia.interface";

export interface DocenteMateria {
  docente_id: number;
  materia_id: number;
  id: number;
}
export interface DocenteMateriaDetalle {
  id:         number;
  materia_id: number;
  materia:    Materia;
}


