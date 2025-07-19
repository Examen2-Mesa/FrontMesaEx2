import { Component } from '@angular/core';
import { PesoTipoEvaluacion } from './interfaces/peso-tipo-evaluacion';
import { PesoTipoEvaluacionService } from './services/peso-tipo-evaluacion.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { GestionService } from '../../admin/gestiones/services/gestion.service';
import { TipoEvaluacionService } from '../../admin/tipo-evaluaciones/services/tipo-evaluacion.service';
import { Materia } from '../../admin/materias/interfaces/materia.interface';
import { Gestion } from '../../admin/gestiones/interfaces/gestion.interface';
import { TipoEvaluacion } from '../../admin/tipo-evaluaciones/interfaces/tipo-evaluacion.interface';
import { MateriaService } from '../../admin/materias/services/materia.service';
import { AuthService } from '../../auth/services/auth.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-peso-tipo-evaluacion',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './peso-tipo-evaluacion.component.html',
  styleUrl: './peso-tipo-evaluacion.component.css',
})
export class PesoTipoEvaluacionComponent {
  page: number = 1;
  limit: number = 10;

  pesosTipoEvaluacion: PesoTipoEvaluacion[] = [];
  todosLosPesosTiposEvaluaciones: PesoTipoEvaluacion[] = [];
  tipoEvaluacion!: PesoTipoEvaluacion;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  pesoTipoEvaluacionForm!: FormGroup;
  
  materias: Materia[] = [];
  gestiones: Gestion[] = [];
  tiposEvaluacion: TipoEvaluacion[] = [];
  
  docente: Docente | null = null;
  isLoading: boolean = false;

  constructor(
    private materiaService: MateriaService,
    private gestionService: GestionService,
    private authService: AuthService,
    private tipoEvaluacionService: TipoEvaluacionService,
    private pesoTipoEvaluacionService: PesoTipoEvaluacionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
     this.materiaService.materias$.subscribe((materias) => {
      this.materias = materias;
    });
    
    this.gestionService.gestiones$.subscribe((gestiones) => {
      this.gestiones = gestiones;
    });
    
    this.tipoEvaluacionService.tipoEvaluaciones$.subscribe((tiposEvaluacion) => {
      this.tiposEvaluacion = tiposEvaluacion;
    });
    
    this.pesoTipoEvaluacionService.pesosTipoEvaluacion$.subscribe(
      (pesosTipoEvaluacion) => {
        this.pesosTipoEvaluacion = pesosTipoEvaluacion;
        this.todosLosPesosTiposEvaluaciones = pesosTipoEvaluacion; // Guardar todas las pesosTipoEvaluacion para la búsqueda
      }
    );
    
    this.docente = this.authService.getCurrentUser();

    this.pesoTipoEvaluacionForm = this.fb.group({
      porcentaje: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      materia_id: ['', Validators.required],
      gestion_id: ['', Validators.required],
      tipo_evaluacion_id: ['', Validators.required],
    });
    
    this.obtenerPesoTipoEvaluaciones();
    this.gestionService.obtenerGestiones().subscribe();
    this.tipoEvaluacionService.obtenerTipoEvaluaciones().subscribe();
    
    if (this.docente) {
      this.materiaService.obtenerMateriasDelDocente(this.docente.id!).subscribe();
    }
    
  }
  
  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las pesosTipoEvaluacion
      this.pesosTipoEvaluacion = [...this.todosLosPesosTiposEvaluaciones];
    } else {
      // Filtrar las pesosTipoEvaluacion según el nombre
      // this.pesosTipoEvaluacion = this.todosLosPesosTiposEvaluaciones.filter(
      //   (tipoEvaluacion) =>
      //     tipoEvaluacion.nombre.toLowerCase().includes(searchTerm)
      // );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.pesoTipoEvaluacionForm.invalid) {
      this.pesoTipoEvaluacionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarPesoTipoEvaluacion();
    } else {
      this.guardarPesoTipoEvaluacion();
    }
  }

  obtenerPesoTipoEvaluaciones(): void {
    if (!this.docente) {
      this.alertsService.toast('No se encontró el docente', 'error');
      return;
    }
    
    this.isLoading = true;
    this.pesoTipoEvaluacionService.obtenerPesoTipoEvaluaciones(this.docente.id!).subscribe({
      next: (data: any) => {
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarPesoTipoEvaluacion(): void {
    const data: PesoTipoEvaluacion = this.pesoTipoEvaluacionForm.value;
    
    if (this.docente) {
      data.docente_id = this.docente.id!;
    }
    
    this.pesoTipoEvaluacionService.guardarPesoTipoEvaluacion(data).subscribe({
      next: (data: any) => {
        this.obtenerPesoTipoEvaluaciones();
        this.cerrarModal();
        this.alertsService.toast(
          'Tipo evaluación guardado correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarPesoTipoEvaluacion(): void {
    const data: PesoTipoEvaluacion = this.pesoTipoEvaluacionForm.value;
    
    if (this.docente) {
      data.docente_id = this.docente.id!;
    }
    
    this.pesoTipoEvaluacionService
      .actualizarPesoTipoEvaluacion(this.tipoEvaluacion.id!, data)
      .subscribe({
        next: (data: any) => {
          this.obtenerPesoTipoEvaluaciones();
          this.cerrarModal();
          this.alertsService.toast(
            'Tipo evaluación actualizado correctamente',
            'success'
          );
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  editarPesoTipoEvaluacion(tipoEvaluacion: PesoTipoEvaluacion): void {
    this.isEditMode = true;
    this.tipoEvaluacion = tipoEvaluacion;
    this.pesoTipoEvaluacionForm.patchValue({
      porcentaje: tipoEvaluacion.porcentaje,
      // docente_id: tipoEvaluacion.docente_id,
      materia_id: tipoEvaluacion.materia_id,
      gestion_id: tipoEvaluacion.gestion_id,
      tipo_evaluacion_id: tipoEvaluacion.tipo_evaluacion_id,
    });
    this.abrirModal();
  }

  eliminarPesoTipoEvaluacion(tipoEvaluacion: PesoTipoEvaluacion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.pesoTipoEvaluacionService
          .eliminarPesoTipoEvaluacion(tipoEvaluacion.id!)
          .subscribe({
            next: (data: any) => {
              this.obtenerPesoTipoEvaluaciones();
              this.alertsService.toast(
                'Tipo de evaluación eliminado correctamente',
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
  
  obtenerNombreMateria(materiaId: number): string {
    const materia = this.materias.find((m) => m.id === materiaId);
    return materia ? materia.nombre : 'Materia no encontrada';
  }
  
  obtenerNombreGestion(gestionId: number): string {
    const gestion = this.gestiones.find((g) => g.id === gestionId);
    return gestion ? gestion.anio : 'Gestión no encontrada';
  }
  
  obtenerNombreTipoEvaluacion(tipoEvaluacionId: number): string {
    const tipoEvaluacion = this.tiposEvaluacion.find(
      (te) => te.id === tipoEvaluacionId
    );
    return tipoEvaluacion ? tipoEvaluacion.nombre : 'Tipo de evaluación no encontrado';
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.pesoTipoEvaluacionForm.reset({
      porcentaje: 0,
      materia_id: '',
      gestion_id: '',
      tipo_evaluacion_id: '',
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.pesoTipoEvaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(
      this.pesoTipoEvaluacionForm,
      field
    );
  }
}
