import { Component } from '@angular/core';
import { Evaluacion } from './interfaces/evaluacion.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalificacionService } from './services/calificacion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TipoEvaluacion } from '../../admin/tipo-evaluaciones/interfaces/tipo-evaluacion.interface';
import { Periodo } from '../../admin/periodos/interfaces/periodo.interface';
import { TipoEvaluacionService } from '../../admin/tipo-evaluaciones/services/tipo-evaluacion.service';
import { PeriodoService } from '../../admin/periodos/services/periodo.service';
import { MateriaService } from '../materias/services/materia.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { AuthService } from '../../auth/services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ListaEstudiantesService } from '../lista-estudiantes/services/lista-estudiantes.service';
import { ListaEstudiantes } from '../lista-estudiantes/interfaces/lista-estudiantes.interface';
import { Materia as MateriaDocente } from '../materias/interfaces/materia.interface';
import { Materia } from '../../admin/materias/interfaces/materia.interface';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-calificaciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgSelectModule,
    LoadingSpinnerComponent
],
  templateUrl: './calificaciones.component.html',
  styleUrl: './calificaciones.component.css',
})
export class CalificacionesComponent {
  page: number = 1;
  limit: number = 10;

  estudiantes: ListaEstudiantes[] = [];
  materias: Materia[] = [];
  materiasDocente: MateriaDocente[] = [];
  tipoEvaluaciones: TipoEvaluacion[] = [];
  periodos: Periodo[] = [];

  evaluaciones: Evaluacion[] = [];
  todasLasEvaluaciones: Evaluacion[] = [];
  evaluacion!: Evaluacion;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  evaluacionForm!: FormGroup;

  docente: Docente | null = null;
  isLoading: boolean = false;

  constructor(
    private authServise: AuthService,
    private estudiantesService: ListaEstudiantesService,
    private materiasService: MateriaService,
    private tipoEvaluacionService: TipoEvaluacionService,
    private periodoService: PeriodoService,
    private calificacionService: CalificacionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.estudiantesService.estudiantes$.subscribe((data) => {
      this.estudiantes = data.map((e) => ({
        ...e,
        nombreCompleto: `${e.estudiante.nombre} ${e.estudiante.apellido}`,
      }));
    });

    this.materiasService.materias$.subscribe((materias) => {
      this.materiasDocente = materias;
    });

    this.tipoEvaluacionService.tipoEvaluaciones$.subscribe(
      (tipoEvaluaciones) => {
        this.tipoEvaluaciones = tipoEvaluaciones;
      }
    );

    this.periodoService.periodos$.subscribe((periodos) => {
      this.periodos = periodos;
    });

    this.calificacionService.evaluaciones$.subscribe((evaluaciones) => {
      this.evaluaciones = evaluaciones;
      this.todasLasEvaluaciones = evaluaciones; // Guardar todas las evaluaciones para la búsqueda
    });

    this.evaluacionForm = this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      descripcion: ['', Validators.required],
      materia_id: [null, Validators.required],
      tipo_evaluacion_id: [null, Validators.required],
      periodo_id: [null, Validators.required],
      estudiante_id: [null, Validators.required],
      valor: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });

    this.docente = this.authServise.getCurrentUser();

    this.obtenerEvaluaciones();
    this.tipoEvaluacionService.obtenerTipoEvaluaciones().subscribe();
    this.periodoService.obtenerPeriodos().subscribe();

    if (this.docente) {
      this.estudiantesService.obtenerEstudiantes(this.docente.id!).subscribe();
      this.materiasService.obtenerMaterias(this.docente.id!).subscribe();
    }
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las evaluaciones
      this.evaluaciones = [...this.todasLasEvaluaciones];
    } else {
      // Filtrar las evaluaciones según el nombre
      this.evaluaciones = this.todasLasEvaluaciones.filter((evaluacion) => {
        return (
          this.obtenerNombreEstudiante(evaluacion.estudiante_id)
            .toLowerCase()
            .includes(searchTerm) ||
          this.obtenerNombreMateria(evaluacion.materia_id)
            .toLowerCase()
            .includes(searchTerm) ||
          this.obtenerNombreTipoEvaluacion(evaluacion.tipo_evaluacion_id)
            .toLowerCase()
            .includes(searchTerm) 
        );
      });
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarEvaluacion();
    } else {
      this.guardarEvaluacion();
    }
  }

  obtenerEvaluaciones(): void {
    if (!this.docente) {
      this.alertsService.toast('No se encontró el docente', 'error');
      return;
    }
    
    this.isLoading = true;
    this.calificacionService.obtenerEvaluaciones(this.docente.id!).subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarEvaluacion(): void {
    const evaluacion: Evaluacion = this.evaluacionForm.value;
    this.calificacionService.guardarEvaluacion(evaluacion).subscribe({
      next: (data: any) => {
        this.obtenerEvaluaciones();
        this.cerrarModal();
        this.alertsService.toast(
          'Evaluacion guardada correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarEvaluacion(): void {
    const evaluacion: Evaluacion = this.evaluacionForm.value;
    this.calificacionService
      .actualizarEvaluacion(this.evaluacion.id!, evaluacion)
      .subscribe({
        next: (data: any) => {
          this.obtenerEvaluaciones();
          this.cerrarModal();
          this.alertsService.toast(
            'Evaluacion actualizada correctamente',
            'success'
          );
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  editarEvaluacion(evaluacion: Evaluacion): void {
    this.isEditMode = true;
    this.evaluacion = evaluacion;
    this.evaluacionForm.patchValue({
      fecha: evaluacion.fecha,
      descripcion: evaluacion.descripcion,
      materia_id: evaluacion.materia_id,
      tipo_evaluacion_id: evaluacion.tipo_evaluacion_id,
      periodo_id: evaluacion.periodo_id,
      estudiante_id: evaluacion.estudiante_id,
      valor: evaluacion.valor,
    });

    this.obtenerMateriasPorEstudiante();
    this.abrirModal();
  }

  eliminarEvaluacion(evaluacion: Evaluacion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.calificacionService.eliminarEvaluacion(evaluacion.id!).subscribe({
          next: (data: any) => {
            this.obtenerEvaluaciones();
            this.alertsService.toast(
              'Evaluacion eliminada correctamente',
              'success'
            );
            this.page = 1;
          },
          error: (error: any) => {
            this.alertsService.toast(error, 'error');
          },
        });
      }
    });
  }

  obtenerMateriasPorEstudiante(): any {
    const id = this.evaluacionForm.get('estudiante_id')?.value;

    if (id) {
      const materias = this.estudiantes
        .filter((item) => item.estudiante.id === id)
        .map((item) => item.materia);

      // Si quieres evitar materias repetidas por id:
      const materiasUnicas = materias.filter(
        (materia, index, self) =>
          index === self.findIndex((m) => m.id === materia.id)
      );
      this.materias = materiasUnicas;
    } else {
      this.materias = [];
    }
  }

  obtenerNombreEstudiante(estudianteId: number): string {
    const estudiante = this.estudiantes.find(
      (e) => e.estudiante.id === estudianteId
    );
    return estudiante
      ? `${estudiante.estudiante.nombre} ${estudiante.estudiante.apellido}`
      : 'Desconocido';
  }

  obtenerNombreMateria(materiaId: number): string {
    const materia = this.materiasDocente.find(
      (m) => m.materia_id === materiaId
    );
    return materia ? materia.materia_nombre : 'Desconocida';
  }

  obtenerNombreTipoEvaluacion(tipoEvaluacionId: number): string {
    const tipoEvaluacion = this.tipoEvaluaciones.find(
      (te) => te.id === tipoEvaluacionId
    );
    return tipoEvaluacion ? tipoEvaluacion.nombre : 'Desconocido';
  }

  obtenerNombrePeriodo(periodoId: number): string {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    return periodo ? periodo.nombre : 'Desconocido';
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.evaluacionForm.reset({
      fecha: '',
      descripcion: '',
      materia_id: null,
      tipo_evaluacion_id: null,
      periodo_id: null,
      estudiante_id: null,
      valor: '',
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.evaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.evaluacionForm, field);
  }
}
