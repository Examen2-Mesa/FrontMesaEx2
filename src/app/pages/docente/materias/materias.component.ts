import { Component } from '@angular/core';
import { Materia } from './interfaces/materia.interface';
import { MateriaService } from './services/materia.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { Usuario } from '../../auth/interfaces/usuario.interface';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-materias',
  imports: [CommonModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.css',
})
export class MateriasComponent {
  page: number = 1;
  limit: number = 10;

  materias: Materia[] = [];
  todasLasMaterias: Materia[] = [];
  docente: Usuario | null = null;

  isLoading: boolean = false;
  
  constructor(
    private materiaService: MateriaService,
    private authService: AuthService,
    private alertsService: AlertsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.materiaService.materias$.subscribe((materias) => {
      this.materias = materias;
      this.todasLasMaterias = materias; // Guardar todas las materias para la búsqueda
    });

    this.docente = this.authService.getCurrentUser();
    this.obtenerMaterias();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las materias
      this.materias = [...this.todasLasMaterias];
    } else {
      // Filtrar las materias según el nombre
      this.materias = this.todasLasMaterias.filter((materia) =>
        materia.materia_nombre.toLowerCase().includes(searchTerm) ||
        materia.curso_nombre.toLowerCase().includes(searchTerm) || 
        materia.curso_nivel.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  obtenerMaterias(): void {
    if (!this.docente) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }
    this.isLoading = true;
    this.materiaService.obtenerMaterias(this.docente.id).subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  
  verEstudiantes(materia: Materia): void {
    if (!this.docente) {
      this.alertsService.toast('Docente no encontrado', 'error');
      return;
    }
    
    this.router.navigate([
      '/docente/estudiantes',
      this.docente!.id,
      materia.curso_id,
      materia.materia_id,
    ]);
  }

}
