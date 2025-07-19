import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Curso } from '../../admin/cursos/interfaces/curso.interface';
import { Materia } from '../../admin/materias/interfaces/materia.interface';
import { MateriaService } from '../../admin/materias/services/materia.service';
import { CursoService } from '../../admin/cursos/services/curso.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { EstudianteService } from './services/estudiante.service';
import { Estudiante } from '../../admin/estudiantes/interfaces/estudiante.interface';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ContextoDocenteService } from '../detalle-estudiante/service/contexto-docente.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

const IMAGE_PREVIEW: string = '/assets/img/image-placeholder.png';

@Component({
  selector: 'app-estudiantes',
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css',
})
export class EstudiantesComponent {
  page: number = 1;
  limit: number = 10;

  docenteId: string | null = null;
  cursoId: string | null = null;
  materiaId: string | null = null;

  curso: Curso | null = null;
  materia: Materia | null = null;

  estudiantes: Estudiante[] = [];
  todosLosEstudiantes: Estudiante[] = [];
   isLoading: boolean = false;

  constructor(
    private estudianteService: EstudianteService,
    private materiaService: MateriaService,
    private cursoService: CursoService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router,
    private contextoDocenteService: ContextoDocenteService,
    private navigationService: NavigationService,
  ) {}

  ngOnInit(): void {
    this.docenteId = this.route.snapshot.paramMap.get('docenteId');
    this.cursoId = this.route.snapshot.paramMap.get('cursoId');
    this.materiaId = this.route.snapshot.paramMap.get('materiaId');

    this.estudianteService.estudiantes$.subscribe((estudiantes) => {
      this.estudiantes = estudiantes;
      this.todosLosEstudiantes = estudiantes;
    });

    this.obtenerEstudiantesPorCursoMateria();
    this.obtenerCursoPorId();
    this.obtenerMateriaPorId();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  getImageDefault(): string {
    return IMAGE_PREVIEW;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todos los estudiantes
      this.estudiantes = [...this.todosLosEstudiantes];
    } else {
      // Filtrar las productos según el nombre
      this.estudiantes = this.todosLosEstudiantes.filter(
        (estudiante) =>
          estudiante.nombre.toLowerCase().includes(searchTerm) ||
          estudiante.apellido.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  obtenerEstudiantesPorCursoMateria(): void {
    if (!this.docenteId) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }

    if (!this.cursoId) {
      this.alertsService.toast('Curso no encontrado', 'error');
      return;
    }

    if (!this.materiaId) {
      this.alertsService.toast('Materia no encontrada', 'error');
      return;
    }

    this.isLoading = true;
    this.estudianteService
      .obtenerEstudiantes(+this.docenteId, +this.cursoId, +this.materiaId)
      .subscribe({
        next: (estudiantes) => {
          this.estudiantes = estudiantes;
        },
        error: (error) => {
          this.alertsService.toast('Error al obtener los estudiantes', 'error');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  obtenerMateriaPorId(): void {
    if (!this.materiaId) {
      this.alertsService.toast('Materia no encontrada', 'error');
      return;
    }

    this.materiaService.obtenerMateriaPorId(+this.materiaId).subscribe({
      next: (materia) => {
        this.materia = materia;
      },
      error: (error) => {
        this.alertsService.toast('Error al obtener la materia', 'error');
      },
    });
  }

  obtenerCursoPorId(): void {
    if (!this.cursoId) {
      this.alertsService.toast('Curso no encontrado', 'error');
      return;
    }

    this.cursoService.obtenerCursoPorId(+this.cursoId).subscribe({
      next: (curso) => {
        this.curso = curso;
      },
      error: (error) => {
        this.alertsService.toast('Error al obtener el curso', 'error');
      },
    });
  }

  regresar(): void {
    this.router.navigate(['/docente/materias']);
  }

  verEstudiante(estudianteId: number): void {
    this.contextoDocenteService.setDatos(
      +this.docenteId!,
      +this.cursoId!,
      +this.materiaId!
    );
    this.navigationService.setOrigen('estudiantes');
    this.router.navigate(['/docente/estudiantes', estudianteId]);
  }
}
