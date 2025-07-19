import { Component } from '@angular/core';
import { Curso } from '../../admin/cursos/interfaces/curso.interface';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CursoService } from './services/curso.service';
import { AuthService } from '../../auth/services/auth.service';
import { Docente } from '../../admin/docentes/interfaces/docente.interface';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-cursos',
  imports: [CommonModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css',
})
export class CursosComponent {
  page: number = 1;
  limit: number = 10;

  docente: Docente | null = null;

  cursos: Curso[] = [];
  todosLosCursos: Curso[] = [];

  isLoading: boolean = false;

  constructor(
    private cursoService: CursoService,
    private alertsService: AlertsService,
    private authService: AuthService // private router: Router
  ) {}

  ngOnInit(): void {
    this.cursoService.cursos$.subscribe((cursos) => {
      this.cursos = cursos;
      this.todosLosCursos = cursos; // Guardar todos los cursos para la búsqueda
    });

    this.docente = this.authService.getCurrentUser();
    this.obtenerCursos();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las cursos
      this.cursos = [...this.todosLosCursos];
    } else {
      // Filtrar las cursos según el nombre
      this.cursos = this.todosLosCursos.filter((curso) =>
        curso.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  obtenerCursos(): void {
    if (!this.docente) {
      this.alertsService.toast('No se encontró el docente', 'error');
      return;
    }

    this.isLoading = true;
    this.cursoService.obtenerCursos(this.docente.id!).subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // get niveles(): string[] {
  //   return Object.values(Nivel);
  // }

  // get paralelos(): string[] {
  //   return Object.values(Paralelo);
  // }

  // get turnos(): string[] {
  //   return Object.values(Turno);
  // }
}
