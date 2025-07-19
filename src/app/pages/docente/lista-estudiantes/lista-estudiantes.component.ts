import { Component } from '@angular/core';
import { ListaEstudiantes } from './interfaces/lista-estudiantes.interface';
import { ListaEstudiantesService } from './services/lista-estudiantes.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { AuthService } from '../../auth/services/auth.service';
import { NavigationService } from '../../../shared/services/navigation.service';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

const IMAGE_PREVIEW: string = '/assets/img/image-placeholder.png';

@Component({
  selector: 'app-lista-estudiantes',
  imports: [CommonModule, FormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './lista-estudiantes.component.html',
  styleUrl: './lista-estudiantes.component.css',
})
export class ListaEstudiantesComponent {
  page: number = 1;
  limit: number = 10;

  docente: Docente | null = null;
  estudiantes: ListaEstudiantes[] = [];
  todosLosEstudiantes: ListaEstudiantes[] = [];
  
  isLoading: boolean = false;

  constructor(
    private estudianteService: ListaEstudiantesService,
    private authService: AuthService,
    private alertsService: AlertsService,
    private router: Router,
    private navigationService: NavigationService,
  ) // private contextoDocenteService: ContextoDocenteService
  {}

  ngOnInit(): void {
    this.docente = this.authService.getCurrentUser();

    this.estudianteService.estudiantes$.subscribe((estudiantes) => {
      this.estudiantes = estudiantes;
      this.todosLosEstudiantes = estudiantes;
    });

    this.obtenerTodosLosEstudiantes();
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
        (data) =>
          data.estudiante.nombre.toLowerCase().includes(searchTerm) ||
          data.estudiante.apellido.toLowerCase().includes(searchTerm) ||
          `${data.estudiante.nombre} ${data.estudiante.apellido}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }
    this.page = 1;
  }

  obtenerTodosLosEstudiantes(): void {
    if (!this.docente) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }

    this.isLoading = true;
    this.estudianteService.obtenerEstudiantes(+this.docente.id!).subscribe({
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

  regresar(): void {
    this.router.navigate(['/docente/materias']);
  }

  verEstudiante(estudianteId: number): void {
    this.navigationService.setOrigen('lista-estudiantes');
    this.router.navigate(['/docente/estudiantes', estudianteId]);
  }
}
