import { Component } from '@angular/core';
import { Inscripcion } from './interfaces/incripcion.interface';
import { Gestion } from '../gestiones/interfaces/gestion.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InscripcionService } from './services/inscripcion.service';
import { GestionService } from '../gestiones/services/gestion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Estudiante } from '../estudiantes/interfaces/estudiante.interface';
import { Curso } from '../cursos/interfaces/curso.interface';
import { EstudianteService } from '../estudiantes/services/estudiante.service';
import { CursoService } from '../cursos/services/curso.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-inscripciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgSelectModule,
    LoadingSpinnerComponent
],
  templateUrl: './inscripciones.component.html',
  styleUrl: './inscripciones.component.css',
})
export class InscripcionesComponent {
  page: number = 1;
  limit: number = 10;

  estudiantes: Estudiante[] = [];
  cursos: Curso[] = [];
  gestiones: Gestion[] = [];
  inscripciones: Inscripcion[] = [];
  todasLasInscripciones: Inscripcion[] = [];
  inscripcion!: Inscripcion;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  inscripcionForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private inscripcionService: InscripcionService,
    private gestionService: GestionService,
    private estudiantesService: EstudianteService,
    private cursosService: CursoService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.gestionService.gestiones$.subscribe((gestiones) => {
      this.gestiones = gestiones;
    });

    this.estudiantesService.estudiantes$.subscribe((estudiantes) => {
      // this.estudiantes = estudiantes;
      this.estudiantes = estudiantes.map((estudiante) => ({
        ...estudiante,
        nombreCompleto: `${estudiante.nombre} ${estudiante.apellido}`,
      }));
    });

    this.cursosService.cursos$.subscribe((cursos) => {
      this.cursos = cursos;
    });

    this.inscripcionService.inscripciones$.subscribe((inscripciones) => {
      this.inscripciones = inscripciones;
      this.todasLasInscripciones = inscripciones; // Guardar todas las inscripciones para la búsqueda
    });

    this.inscripcionForm = this.fb.group({
      descripcion: ['', Validators.required],
      fecha: ['', Validators.required],
      estudiante_id: [null, Validators.required],
      curso_id: [null, Validators.required],
      gestion_id: ['', Validators.required],
    });

    this.gestionService.obtenerGestiones().subscribe();
    this.estudiantesService.obtenerEstudiantes().subscribe();
    this.cursosService.obtenerCursos().subscribe();
    this.obtenerInscripciones();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las inscripciones
      this.inscripciones = [...this.todasLasInscripciones];
    } else {
      // Filtrar las inscripciones según el nombre
      this.inscripciones = this.todasLasInscripciones.filter((inscripcion) =>
        inscripcion.descripcion.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.inscripcionForm.invalid) {
      this.inscripcionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarInscripcion();
    } else {
      this.guardarInscripcion();
    }
  }

  obtenerInscripciones(): void {
    this.isLoading = true;
    this.inscripcionService.obtenerInscripciones().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarInscripcion(): void {
    const inscripcion: Inscripcion = this.inscripcionForm.value;
    this.inscripcionService.guardarInscripcion(inscripcion).subscribe({
      next: (data: any) => {
        this.obtenerInscripciones();
        this.cerrarModal();
        this.alertsService.toast(
          'Inscripción guardada correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarInscripcion(): void {
    const inscripcion: Inscripcion = this.inscripcionForm.value;
    const periodoId = this.inscripcion.id!;
    this.inscripcionService
      .actualizarInscripcion(periodoId, inscripcion)
      .subscribe({
        next: (data: any) => {
          this.obtenerInscripciones();
          this.cerrarModal();
          this.alertsService.toast(
            'Inscripción actualizada correctamente',
            'success'
          );
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  editarInscripcion(inscripcion: Inscripcion): void {
    this.isEditMode = true;
    this.inscripcion = inscripcion;
    this.inscripcionForm.patchValue({
      descripcion: inscripcion.descripcion,
      fecha: inscripcion.fecha,
      estudiante_id: inscripcion.estudiante_id,
      curso_id: inscripcion.curso_id,
      gestion_id: inscripcion.gestion_id,
    });
    this.abrirModal();
  }

  eliminarInscripcion(inscripcion: Inscripcion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.inscripcionService.eliminarInscripcion(inscripcion.id!).subscribe({
          next: (data: any) => {
            this.obtenerInscripciones();
            this.alertsService.toast(
              'Inscripción eliminada correctamente',
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

  obtenerGestion(id: number): string {
    const gestion = this.gestiones.find((gestion) => gestion.id === id);
    return gestion ? gestion.anio : '';
  }

  obtenerEstudiante(id: number): string {
    const estudiante = this.estudiantes.find(
      (estudiante) => estudiante.id === id
    );
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : '';
  }

  obtenerCurso(id: number): string {
    const curso = this.cursos.find((curso) => curso.id === id);
    return curso ? curso.nombre : '';
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.inscripcionForm.reset({
      descripcion: '',
      fecha: '',
      estudiante_id: null,
      curso_id: null,
      gestion_id: '',
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.inscripcionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.inscripcionForm, field);
  }
}
