import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Curso } from '../cursos/interfaces/curso.interface';
import { CursoService } from '../cursos/services/curso.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CursoMateriaService } from './services/curso-materia.service';
import { Materia } from '../materias/interfaces/materia.interface';
import { MateriaService } from '../materias/services/materia.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CursoMateriaDetalle } from './interfaces/curso-materia.interface';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-curso-materia',
  imports: [CommonModule, FormsModule, NgSelectModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './curso-materia.component.html',
  styleUrl: './curso-materia.component.css',
})
export class CursoMateriaComponent {
  page: number = 1;
  limit: number = 10;

  curso: Curso | null = null;
  cursoId: string | null = null;
  materiasAsignadas: CursoMateriaDetalle[] = [];
  materias: Materia[] = [];

  isAsignando: boolean = false;
  materiaSeleccionada: number | null = null;
  
  isLoadingCurso: boolean = false;
  isLoadingMaterias: boolean = false;

  constructor(
    private cursoService: CursoService,
    private cursoMateriaService: CursoMateriaService,
    private materiaService: MateriaService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el parámetro 'id' de la URL
    this.cursoId = this.route.snapshot.paramMap.get('id');

    this.materiaService.materias$.subscribe((materias) => {
      this.materias = materias;
    });

    this.obtenerCursoPorId();
    this.obtenerMateriasPorCurso();
    this.materiaService.obtenerMaterias().subscribe();
  }

  obtenerCursoPorId(): void {
    if (!this.cursoId) {
      this.alertsService.toast('Curso no encontrado', 'error');
      return;
    }

    this.isLoadingCurso = true;
    this.cursoService.obtenerCursoPorId(+this.cursoId).subscribe({
      next: (curso) => {
        this.curso = curso;
      },
      error: (error) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoadingCurso = false;
      },
    });
  }

  obtenerMateriasPorCurso(): void {
    if (!this.cursoId) {
      this.alertsService.toast('Curso no encontrado', 'error');
      return;
    }

    this.isLoadingMaterias = true;
    this.cursoMateriaService.obtenerMateriasPorCurso(+this.cursoId).subscribe({
      next: (cursoDetalle) => {
        this.materiasAsignadas = cursoDetalle;

        if (this.materiasAsignadas.length <= this.limit) {
          this.page = 1;
        }
      },
      error: (error) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoadingMaterias = false;
      },
    });
  }

  asignarMateriaACurso(): void {
    if (!this.cursoId) {
      this.alertsService.toast('Curso no encontrado', 'error');
      return;
    }

    this.cursoMateriaService
      .asignarMateriaACurso(+this.cursoId, this.materiaSeleccionada!)
      .subscribe({
        next: (resp) => {
          this.obtenerMateriasPorCurso();
          this.alertsService.toast(
            'La materia se asignó correctamente al curso.',
            'success'
          );
        },
        error: (error) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  eliminarMateriaDeCurso(cursoMateriaId: number): void {
    this.cursoMateriaService.eliminarMateriaDeCurso(cursoMateriaId).subscribe({
      next: (resp) => {
        this.obtenerMateriasPorCurso();
        this.alertsService.toast(
          'La materia se desasignó correctamente del curso.',
          'success'
        );
      },
      error: (error) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  asignarMateria() {
    if (this.materiaSeleccionada) {
      // Buscar la materia en el listado de materias
      const materia = this.materias.find(
        (m) => m.id === this.materiaSeleccionada
      );
      if (materia) {
        // Evitar duplicados
        const yaAsignada = this.materiasAsignadas
          .map((m) => m.materia.id)
          .includes(materia.id!);

        if (!yaAsignada) {
          this.asignarMateriaACurso();
        } else {
          this.alertsService.toast(
            `La materia ${materia.nombre} ya está asignada a este curso.`,
            'info'
          );
        }
      }
      // Reiniciar selección
      this.materiaSeleccionada = null;
    } else {
      this.alertsService.toast('Seleccione una materia', 'info');
    }
  }

  quitarMateria(cursoMateria: CursoMateriaDetalle) {
    this.alertsService
      .showConfirmationDialog('Sí, desasignar')
      .then((confirmed) => {
        if (confirmed) {
          this.cursoMateriaService
            .eliminarMateriaDeCurso(cursoMateria.id!)
            .subscribe({
              next: (data: any) => {
                this.obtenerMateriasPorCurso();
                this.alertsService.toast(
                  'La materia se desasignó correctamente del curso.',
                  'success'
                );
              },
              error: (error: any) => {
                this.alertsService.toast(error, 'error');
              },
            });
        }
      });
  }

  activarAsignacion() {
    this.isAsignando = true;
  }

  cancelarAsignacion() {
    this.isAsignando = false;
    this.materiaSeleccionada = null;
  }

  regresar(): void {
    this.router.navigate(['/admin/cursos']);
  }
}
