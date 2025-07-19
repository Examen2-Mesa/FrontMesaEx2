import { Component } from '@angular/core';
import { Docente } from '../docentes/interfaces/docente.interface';
import { DocenteMateriaDetalle } from './interfaces/docente-materia.interface';
import { Materia } from '../materias/interfaces/materia.interface';
import { DocenteService } from '../docentes/services/docente.service';
import { DocenteMateriaService } from './services/docente-materia.service';
import { MateriaService } from '../materias/services/materia.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-docente-materia',
  imports: [CommonModule, FormsModule, NgSelectModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './docente-materia.component.html',
  styleUrl: './docente-materia.component.css',
})
export class DocenteMateriaComponent {
  page: number = 1;
  limit: number = 10;

  docente: Docente | null = null;
  docenteId: string | null = null;
  materiasAsignadas: DocenteMateriaDetalle[] = [];
  materias: Materia[] = [];

  isAsignando: boolean = false;
  materiaSeleccionada: number | null = null;
  
  isLoadingDocente: boolean = false;
  isLoadingDetalle: boolean = false;

  constructor(
    private docenteService: DocenteService,
    private docenteMateriaService: DocenteMateriaService,
    private materiaService: MateriaService,
    private alertsService: AlertsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el parámetro 'id' de la URL
    this.docenteId = this.route.snapshot.paramMap.get('id');

    this.materiaService.materias$.subscribe((materias) => {
      this.materias = materias;
    });

    this.obtenerDocentePorId();
    this.obtenerMateriasPorDocente();
    this.materiaService.obtenerMaterias().subscribe();
  }

  obtenerDocentePorId(): void {
    if (!this.docenteId) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }

    this.isLoadingDocente = true;
    this.docenteService.obtenerDocentePorId(+this.docenteId).subscribe({
      next: (docente) => {
        this.docente = docente;
      },
      error: (error) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoadingDocente = false;
      },
    });
  }

  obtenerMateriasPorDocente(): void {
    if (!this.docenteId) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }

    this.isLoadingDetalle = true;
    this.docenteMateriaService.obtenerMateriasPorDocente(+this.docenteId).subscribe({
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
        this.isLoadingDetalle = false;
      },
    });
  }

  asignarMateriaADocente(): void {
    if (!this.docenteId) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }

    this.docenteMateriaService
      .asignarMateriaADocente(+this.docenteId, this.materiaSeleccionada!)
      .subscribe({
        next: (resp) => {
          this.obtenerMateriasPorDocente();
          this.alertsService.toast(
            'La materia se asignó correctamente al docente.',
            'success'
          );
        },
        error: (error) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  eliminarMateriaDeDocente(cursoMateriaId: number): void {
    this.docenteMateriaService.eliminarMateriaDeDocente(cursoMateriaId).subscribe({
      next: (resp) => {
        this.obtenerMateriasPorDocente();
        this.alertsService.toast(
          'La materia se desasignó correctamente del docente.',
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
          this.asignarMateriaADocente();
        } else {
          this.alertsService.toast(
            `La materia ${materia.nombre} ya está asignada a este docente.`,
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

  quitarMateria(cursoMateria: DocenteMateriaDetalle) {
    this.alertsService
      .showConfirmationDialog('Sí, desasignar')
      .then((confirmed) => {
        if (confirmed) {
          this.docenteMateriaService
            .eliminarMateriaDeDocente(cursoMateria.id!)
            .subscribe({
              next: (data: any) => {
                this.obtenerMateriasPorDocente();
                this.alertsService.toast(
                  'La materia se desasignó correctamente del docente.',
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
    this.router.navigate(['/admin/docentes']);
  }
}
