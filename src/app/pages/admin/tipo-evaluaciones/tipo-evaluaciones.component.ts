import { Component } from '@angular/core';
import { TipoEvaluacion } from './interfaces/tipo-evaluacion.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TipoEvaluacionService } from './services/tipo-evaluacion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-tipo-evaluaciones',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './tipo-evaluaciones.component.html',
  styleUrl: './tipo-evaluaciones.component.css',
})
export class TipoEvaluacionesComponent {
  page: number = 1;
  limit: number = 10;

  tipoEvaluaciones: TipoEvaluacion[] = [];
  todosLosTiposEvaluaciones: TipoEvaluacion[] = [];
  tipoEvaluacion!: TipoEvaluacion;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  tipoEvaluacionForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private tipoEvaluacionService: TipoEvaluacionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.tipoEvaluacionService.tipoEvaluaciones$.subscribe(
      (tipoEvaluaciones) => {
        this.tipoEvaluaciones = tipoEvaluaciones;
        this.todosLosTiposEvaluaciones = tipoEvaluaciones; // Guardar todas las tipoEvaluaciones para la búsqueda
      }
    );

    this.tipoEvaluacionForm = this.fb.group({
      nombre: ['', Validators.required],
    });
    this.obtenerTipoEvaluaciones();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las tipoEvaluaciones
      this.tipoEvaluaciones = [...this.todosLosTiposEvaluaciones];
    } else {
      // Filtrar las tipoEvaluaciones según el nombre
      this.tipoEvaluaciones = this.todosLosTiposEvaluaciones.filter(
        (tipoEvaluacion) =>
          tipoEvaluacion.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.tipoEvaluacionForm.invalid) {
      this.tipoEvaluacionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarTipoEvaluacion();
    } else {
      this.guardarTipoEvaluacion();
    }
  }

  obtenerTipoEvaluaciones(): void {
    this.isLoading = true;
    this.tipoEvaluacionService.obtenerTipoEvaluaciones().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarTipoEvaluacion(): void {
    const { nombre } = this.tipoEvaluacionForm.value;
    this.tipoEvaluacionService.guardarTipoEvaluacion(nombre).subscribe({
      next: (data: any) => {
        this.obtenerTipoEvaluaciones();
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

  actualizarTipoEvaluacion(): void {
    const { nombre } = this.tipoEvaluacionForm.value;
    const tipoEvaluacionId = this.tipoEvaluacion.id;
    this.tipoEvaluacionService
      .actualizarTipoEvaluacion(tipoEvaluacionId, nombre)
      .subscribe({
        next: (data: any) => {
          this.obtenerTipoEvaluaciones();
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

  editarTipoEvaluacion(tipoEvaluacion: TipoEvaluacion): void {
    this.isEditMode = true;
    this.tipoEvaluacion = tipoEvaluacion;
    this.tipoEvaluacionForm.patchValue({
      nombre: tipoEvaluacion.nombre,
    });
    this.abrirModal();
  }

  eliminarTipoEvaluacion(tipoEvaluacion: TipoEvaluacion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.tipoEvaluacionService
          .eliminarTipoEvaluacion(tipoEvaluacion.id)
          .subscribe({
            next: (data: any) => {
              this.obtenerTipoEvaluaciones();
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

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.tipoEvaluacionForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.tipoEvaluacionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(
      this.tipoEvaluacionForm,
      field
    );
  }
}
