export interface Evaluacion {
  fecha:              Date;
  descripcion:        string;
  valor:              number;
  estudiante_id:      number;
  materia_id:         number;
  tipo_evaluacion_id: number;
  periodo_id:         number;
  id?:                 number;
}
