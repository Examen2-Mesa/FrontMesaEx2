import { Component } from '@angular/core';
import { Curso, Nivel, Paralelo, Turno } from './interfaces/curso.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CursoService } from './services/curso.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-cursos',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css',
})
export class CursosComponent {
  page: number = 1;
  limit: number = 10;

  cursos: Curso[] = [];
  todosLosCursos: Curso[] = [];
  curso!: Curso;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  cursoForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private cursoService: CursoService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cursoService.cursos$.subscribe((cursos) => {
      this.cursos = cursos;
      this.todosLosCursos = cursos; // Guardar todos los cursos para la búsqueda
    });

    this.cursoForm = this.fb.group({
      nombre: ['', Validators.required],
      nivel: ['', Validators.required],
      paralelo: ['', Validators.required],
      turno: ['', Validators.required],
    });
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

  onSubmit(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarCurso();
    } else {
      this.guardarCurso();
    }
  }

  obtenerCursos(): void {
    this.isLoading = true;
    this.cursoService.obtenerCursos().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarCurso(): void {
    const curso: Curso = this.cursoForm.value;
    this.cursoService.guardarCurso(curso).subscribe({
      next: (data: any) => {
        this.obtenerCursos();
        this.cerrarModal();
        this.alertsService.toast('Curso guardado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarCurso(): void {
    const curso: Curso = this.cursoForm.value;
    const cursoId = this.curso.id!;
    this.cursoService.actualizarCurso(cursoId, curso).subscribe({
      next: (data: any) => {
        this.obtenerCursos();
        this.cerrarModal();
        this.alertsService.toast('Curso actualizado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarCurso(curso: Curso): void {
    this.isEditMode = true;
    this.curso = curso;
    this.cursoForm.patchValue({
      nombre: curso.nombre,
      nivel: curso.nivel,
      paralelo: curso.paralelo,
      turno: curso.turno,
    });
    this.abrirModal();
  }

  eliminarCurso(curso: Curso): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.cursoService.eliminarCurso(curso.id!).subscribe({
          next: (data: any) => {
            this.obtenerCursos();
            this.alertsService.toast(
              'Curso eliminado correctamente',
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
    this.cursoForm.reset({
      nombre: '',
      nivel: '',
      paralelo: '',
      turno: '',
    });
  }

  asignarMaterias(curso: Curso) {
    this.router.navigate(['/admin/asignar-materia', curso.id]);
  }

  get niveles(): string[] {
    return Object.values(Nivel);
  }

  get paralelos(): string[] {
    return Object.values(Paralelo);
  }

  get turnos(): string[] {
    return Object.values(Turno);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.cursoForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.cursoForm, field);
  }
}
