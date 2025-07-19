export interface ResumenRendimiento {
  fecha:      Date;
  periodo_id: number;
  resumen:    { [key: string]: Resumen };
}

export interface Resumen {
  id:          number;
  nombre:      string;
  promedio?:   number;
  total:       number;
  detalle:     Detalle[];
  porcentaje?: number;
}

export interface Detalle {
  fecha:       Date;
  descripcion: string;
  valor:       number;
}
