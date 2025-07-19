export interface CalificacionResponse {
  periodo_id: number;
  gestion_id: number;
  promedio_general: number;
  resumen: { [key: string]: Resumen };
}

export interface Resumen {
  id: number;
  nombre: string;
  promedio?: number;
  total: number;
  detalle: Detalle[];
  puntos: number;
  porcentaje?: number;
}

export interface Detalle {
  fecha: Date;
  descripcion: string;
  valor: number;
}
