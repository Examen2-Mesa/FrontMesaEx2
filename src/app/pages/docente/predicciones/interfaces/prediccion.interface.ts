export interface Prediccion {
  success: boolean;
  mensaje: string;
  data:    Data[];
}

export interface Data {
  id:                     number;
  estudiante_id:          number;
  materia_id:             number;
  periodo_id:             number;
  promedio_notas:         number;
  porcentaje_asistencia:  number;
  promedio_participacion: number;
  resultado_numerico:     number;
  clasificacion:          string;
  fecha_generada:         Date;
}
