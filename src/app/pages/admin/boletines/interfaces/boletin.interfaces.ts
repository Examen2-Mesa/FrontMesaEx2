import { Estudiante } from "../../estudiantes/interfaces/estudiante.interface";

export interface InformacionAcademica {
  estudiantesSeleccionadoInfo?: Estudiante[]; // Opcional, si lo usas

  success: boolean;
  mensaje: string;

  gestion: {
    id: number;
    anio: number;
    descripcion: string;
  };

  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    codigo: string; // Ej: "EST123"
  };

  usuario_consultante: {
    id: number;
    tipo: "estudiante" | "padre" | "docente" | "admin" | string;
    permisos: {
      puede_ver_todas_materias: boolean;
      materias_limitadas?: number[] | null; // Ids de materias permitidas (solo para docente)
    };
  };

  estadisticas_generales: {
    promedio_general: number;
    promedio_predicciones: number;
    total_materias: number;
    total_evaluaciones: number;
    mejor_materia: string | null;
  };

  materias: MateriaResultado[];

  metadatos: {
    fecha_consulta: string; // ISO fecha
    total_periodos: number;
    predicciones_generadas: number;
    materias_filtradas_por_permisos: boolean;
  };

  envio_correo?: {
    enviado: boolean;
    mensaje: string;
    destinatario: string;
  };
}

export interface MateriaResultado {
  materia: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  docente: DocenteInfo | null;
  curso_id: number;
  periodos: PeriodoResultado[];
  estadisticas: {
    promedio_rendimiento: number;
    promedio_prediccion: number;
    mejor_periodo: number;
    peor_periodo: number;
    total_periodos_evaluados: number;
  };
}

export interface DocenteInfo {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
}

export interface PeriodoResultado {
  periodo_id: number;
  periodo_nombre: string;
  fecha_inicio: string; // ISO
  fecha_fin: string; // ISO

  rendimiento: {
    nota_final: number;
    detalle_evaluaciones: DetalleEvaluacion[];
    fecha_calculo: string | null; // ISO o null
  };

  prediccion_ml: PrediccionML | null;
}

export interface DetalleEvaluacion {
  tipo_evaluacion_id: number;
  tipo_nombre: string;
  promedio: number;
  peso: number;
  aporte: number;
  cantidad_evaluaciones: number;
}

export interface PrediccionML {
  id: number;
  promedio_notas: number;
  porcentaje_asistencia: number;
  promedio_participacion: number;
  resultado_numerico: number;
  clasificacion: string;
  fecha_generada: string; // ISO
}
export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
}