import { Component } from '@angular/core';
import { ListaEstudiantes } from '../lista-estudiantes/interfaces/lista-estudiantes.interface';
import { Materia as MateriaDocente } from '../materias/interfaces/materia.interface';
import { Materia } from '../../admin/materias/interfaces/materia.interface';
import { Gestion } from '../../admin/gestiones/interfaces/gestion.interface';
import { Prediccion } from './interfaces/prediccion.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ListaEstudiantesService } from '../lista-estudiantes/services/lista-estudiantes.service';
import { MateriaService } from '../materias/services/materia.service';
import { GestionService } from '../../admin/gestiones/services/gestion.service';
import { PrediccionService } from './services/prediccion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Periodo } from '../../admin/periodos/interfaces/periodo.interface';
import { PeriodoService } from '../../admin/periodos/services/periodo.service';

@Component({
  selector: 'app-predicciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './predicciones.component.html',
  styleUrl: './predicciones.component.css',
})
export class PrediccionesComponent {
  estudiantes: ListaEstudiantes[] = [];
  materias: Materia[] = [];
  materiasDocente: MateriaDocente[] = [];
  gestiones: Gestion[] = [];
  periodos: Periodo[] = [];

  prediccion: Prediccion | null = null;
  prediccionForm!: FormGroup;
  docente: Docente | null = null;

  isLoading: boolean = false;

  constructor(
    private authServise: AuthService,
    private estudiantesService: ListaEstudiantesService,
    private materiasService: MateriaService,
    private gestionService: GestionService,
    private periodoService: PeriodoService,
    private prediccionesService: PrediccionService,
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

    this.gestionService.gestiones$.subscribe((gestiones) => {
      this.gestiones = gestiones;
    });
    
    this.periodoService.periodos$.subscribe((periodos) => {
      this.periodos = periodos;
    });

    this.prediccionForm = this.fb.group({
      materia_id: [null, Validators.required],
      gestion_id: [null, Validators.required],
      estudiante_id: [null, Validators.required],
    });

    this.docente = this.authServise.getCurrentUser();
    this.gestionService.obtenerGestiones().subscribe();
    this.periodoService.obtenerPeriodos().subscribe();

    if (this.docente) {
      this.estudiantesService.obtenerEstudiantes(this.docente.id!).subscribe();
      this.materiasService.obtenerMaterias(this.docente.id!).subscribe();
    }
  }

  onSubmit(): void {
    if (this.prediccionForm.invalid) {
      this.prediccionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    // this.generarPrediccionPorGestion();
    this.obtenerPrediccionPorGestion();
  }

  generarPrediccionPorGestion(): void {
    const estudianteId = this.prediccionForm.get('estudiante_id')?.value;
    const materiaId = this.prediccionForm.get('materia_id')?.value;
    const gestionId = this.prediccionForm.get('gestion_id')?.value;

    this.prediccionesService
      .generarPrediccionPorGestion(estudianteId, materiaId, gestionId)
      .subscribe({
        next: (prediccion) => {
          console.log('Predicción obtenida:', prediccion);
          this.prediccion = prediccion;
        },
        error: (error) => {
          this.alertsService.toast(error, 'error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  
  obtenerPrediccionPorGestion(): void {
    const estudianteId = this.prediccionForm.get('estudiante_id')?.value;
    const materiaId = this.prediccionForm.get('materia_id')?.value;
    const gestionId = this.prediccionForm.get('gestion_id')?.value;

    this.isLoading = true;
    this.prediccionesService
      .obtenerPrediccionPorGestion(estudianteId, materiaId, gestionId)
      .subscribe({
        next: (prediccion) => {
          console.log('Predicción obtenida:', prediccion);
          this.prediccion = prediccion;
        },
        error: (error) => {
          this.alertsService.toast(error, 'error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  obtenerMateriasPorEstudiante(): any {
    const id = this.prediccionForm.get('estudiante_id')?.value;

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

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.prediccionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.prediccionForm, field);
  }

  obtenerNombreMateria(materiaId: number): string {
    const materia = this.materiasDocente.find(
      (m) => m.materia_id === materiaId
    );
    return materia ? materia.materia_nombre : 'Materia no encontrada';
  }

  obtenerNombreEstudiante(estudianteId: number): string {
    const estudiante = this.estudiantes.find(
      (e) => e.estudiante.id === estudianteId
    );
    return estudiante
      ? estudiante.estudiante.nombre + ' ' + estudiante.estudiante.apellido
      : 'Estudiante no encontrado';
  }

  obtenerNombrePeriodo(periodoId: number): string {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    return periodo ? periodo.nombre : 'Periodo no encontrado';
  }
}
