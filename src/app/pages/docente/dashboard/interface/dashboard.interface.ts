export interface Dashboard {
  gestion:                   string;
  materias_asignadas:        number;
  nombres_materias:          string[];
  total_cursos:              number;
  total_estudiantes:         number;
  total_inscripciones:       number;
  total_evaluaciones:        number;
  total_rendimientos:        number;
  total_periodos:            number;
  evaluaciones_por_tipo:     { [key: string]: number };
  promedios_materias:        { [key: string]: number };
  promedio_asistencia:       number;
  promedio_participacion:    number;
  top_estudiantes:           { [key: string]: TopEstudiante[] };
  ultima_evaluacion:         Date;
  materias_sin_evaluaciones: any[];
}

export interface TopEstudiante {
  nombre:   string;
  apellido: string;
  nota:     number;
}
