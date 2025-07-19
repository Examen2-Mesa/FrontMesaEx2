import { Component } from '@angular/core';
import { Estudiante } from '../../admin/estudiantes/interfaces/estudiante.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { EstudianteService } from '../../admin/estudiantes/services/estudiante.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ContextoDocenteService } from './service/contexto-docente.service';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../shared/services/navigation.service';
import { ResumenRendimientoService } from './service/resumen-rendimiento.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const IMAGE_PREVIEW: string = '/assets/img/image-placeholder.png';

// Interfaces proporcionadas
export interface ResumenRendimiento {
  fecha: Date;
  periodo_id: number;
  resumen: { [key: string]: Resumen };
}

export interface Resumen {
  id: number;
  nombre: string;
  promedio?: number;
  total: number;
  detalle: Detalle[];
  porcentaje?: number;
}

export interface Detalle {
  fecha: Date;
  descripcion: string;
  valor: number;
}

// Interfaz auxiliar para el mapeo de tarjetas
interface TarjetaEvaluacion {
  nombre: string;
  promedio: number;
  total: number;
  evaluaciones: number;
  categoria: string;
  color: string;
  gradiente: string;
  detalles: {
    descripcion: string;
    valor: number;
    fecha: string;
    colorPunto: string;
  }[];
}

@Component({
  selector: 'app-detalle-estudiante',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './detalle-estudiante.component.html',
  styleUrl: './detalle-estudiante.component.css',
})
export class DetalleEstudianteComponent {
  promedioGeneral: number = 0;
  totalEvaluaciones: number = 0;
  tarjetas: TarjetaEvaluacion[] = [];
  resumenAsistencia: Resumen | null = null;

  estudianteId: string | null = null;
  estudiante: Estudiante | null = null;

  docenteId: number | null = null;
  cursoId: number | null = null;
  materiaId: number | null = null;

  isLoadingEstudiante: boolean = false;
  isLoadingDetalle: boolean = false;

  resumenRendimiento: ResumenRendimiento | null = null;

  constructor(
    private estudianteService: EstudianteService,
    private resumenRendimientoService: ResumenRendimientoService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router,
    private contextoDocenteService: ContextoDocenteService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.estudianteId = this.route.snapshot.paramMap.get('estudianteId');
    this.obtenerEstudiantePorId();

    this.docenteId = this.contextoDocenteService.getDocenteId();
    this.cursoId = this.contextoDocenteService.getCursoId();
    this.materiaId = this.contextoDocenteService.getMateriaId();

    this.resumenRendimientoService.evaluaciones$.subscribe((rendimiento) => {
      this.resumenRendimiento = rendimiento;
      this.procesarDatos();
    });

    this.isLoadingDetalle = true;
    this.resumenRendimientoService
      .obtenerEvaluaciones(Number(this.estudianteId), Number(this.materiaId))
      .subscribe({
        next: (resumen) => {
          console.log('Resumen de rendimiento:', resumen);
        },
        error: (error) => {
          this.alertsService.toast('Error al obtener el resumen', 'error');
        },
        complete: () => {
          this.isLoadingDetalle = false;
        },
      });
  }
  
  ngOnDestroy(): void {
    this.contextoDocenteService.limpiarDatos();
    this.navigationService.clearOrigen();
  }

  getImageDefault(): string {
    return IMAGE_PREVIEW;
  }
  
  verificarExisteMateriaId(): boolean {
    if (!this.materiaId || !this.cursoId || !this.docenteId) {
      return false;
    }
    return true;
  }

  obtenerEstudiantePorId(): void {
    if (!this.estudianteId) {
      this.alertsService.toast('ID de estudiante no válido', 'error');
      return;
    }

    this.isLoadingEstudiante = true;
    this.estudianteService.obtenerEstudiantePorId(this.estudianteId).subscribe({
      next: (estudiante) => {
        this.estudiante = estudiante;
      },
      error: (error) => {
        this.alertsService.toast('Error al obtener el estudiante', 'error');
      },
      complete: () => {
        this.isLoadingEstudiante = false;
      },
    });
  }

  calcularEdad(fechaNacimiento: string | Date): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  regresar(): void {
    const origen = this.navigationService.getOrigen();
    if (origen === 'estudiantes') {
      this.router.navigate([
        '/docente/estudiantes',
        this.docenteId,
        this.cursoId,
        this.materiaId,
      ]);
    } else if (origen === 'lista-estudiantes') {
      this.router.navigate(['/docente/estudiantes']);
    }

    this.navigationService.clearOrigen();
    this.contextoDocenteService.limpiarDatos();
  }

  // Configuración de colores y estilos por tipo de evaluación
  private configuracionTipos: { [key: string]: any } = {
    examenes: {
      color: 'warning',
      gradiente: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
      fondo: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
    },
    tareas: {
      color: 'warning',
      gradiente: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
      fondo: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
    },
    exposiciones: {
      color: 'warning',
      gradiente: 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)',
      fondo: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
    },
    participacion: {
      color: 'success',
      gradiente: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
      fondo: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8f1 100%)',
    },
    proyectos: {
      color: 'info',
      gradiente: 'linear-gradient(135deg, #ab47bc 0%, #9c27b0 100%)',
      fondo: 'linear-gradient(135deg, #f3e5f5 0%, #faf4ff 100%)',
    },
    laboratorios: {
      color: 'danger',
      gradiente: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
      fondo: 'linear-gradient(135deg, #ffebee 0%, #fef5f5 100%)',
    },
  };

  procesarDatos() {
    if (!this.resumenRendimiento?.resumen) return;

    // Calcular promedio general y total de evaluaciones
    let sumaPromedios = 0;
    let contadorTipos = 0;
    this.totalEvaluaciones = 0;

    // Procesar cada tipo de evaluación
    Object.keys(this.resumenRendimiento.resumen).forEach((tipo) => {
      const resumen = this.resumenRendimiento!.resumen[tipo];

      if (resumen.nombre.toLowerCase() === 'asistencia') {
        this.resumenAsistencia = resumen;
        return;
      }

      if (resumen.promedio) {
        sumaPromedios += resumen.promedio;
        contadorTipos++;
      }

      this.totalEvaluaciones += resumen.detalle.length;

      // Crear tarjeta para cada tipo
      this.tarjetas.push(this.crearTarjeta(tipo, resumen));
    });

    this.promedioGeneral =
      contadorTipos > 0 ? sumaPromedios / contadorTipos : 0;
  }

  crearTarjeta(tipo: string, resumen: Resumen): TarjetaEvaluacion {
    const tipoNormalizado = tipo.toLowerCase();
    const config =
      this.configuracionTipos[tipoNormalizado] ||
      this.configuracionTipos['examenes'];

    return {
      nombre: resumen.nombre,
      promedio: resumen.promedio || 0,
      total: resumen.total,
      evaluaciones: resumen.detalle.length,
      categoria: this.obtenerCategoria(resumen.promedio || 0),
      color: config.color,
      gradiente: config.gradiente,
      detalles: resumen.detalle.map((detalle) => ({
        descripcion: detalle.descripcion,
        valor: detalle.valor,
        fecha: this.formatearFecha(detalle.fecha),
        colorPunto: this.obtenerColorPunto(detalle.valor),
      })),
    };
  }

  obtenerCategoria(promedio: number): string {
    if (promedio >= 85) return 'Excelente';
    if (promedio >= 70) return 'Bueno';
    if (promedio >= 60) return 'Regular';
    return 'Necesita Mejorar';
  }

  obtenerColorPunto(valor: number): string {
    if (valor >= 85) return '#4caf50'; // Verde
    if (valor >= 70) return '#ff9800'; // Naranja
    return '#f44336'; // Rojo
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  obtenerColorTexto(valor: number): string {
    if (valor >= 85) return '#4caf50';
    if (valor >= 70) return '#ff9800';
    return '#f44336';
  }

  obtenerCategoriaGeneral(): string {
    return this.obtenerCategoria(this.promedioGeneral);
  }

  obtenerConfiguracion(tipo: string) {
    const tipoNormalizado = tipo.toLowerCase();
    return (
      this.configuracionTipos[tipoNormalizado] ||
      this.configuracionTipos['examenes']
    );
  }

  trackByTarjeta(index: number, tarjeta: any): any {
    return tarjeta.nombre;
  }
}
