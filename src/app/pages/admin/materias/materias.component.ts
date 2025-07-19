import { Component } from '@angular/core';
import { Materia } from './interfaces/materia.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MateriaService } from './services/materia.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-materias',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.css',
})
export class MateriasComponent {
  page: number = 1;
  limit: number = 10;

  materias: Materia[] = [];
  todasLasMaterias: Materia[] = [];
  materia!: Materia;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  materiaForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private materiaService: MateriaService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.materiaService.materias$.subscribe((materias) => {
      this.materias = materias;
      this.todasLasMaterias = materias; // Guardar todas las materias para la búsqueda
    });

    this.materiaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
    });
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
        materia.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.materiaForm.invalid) {
      this.materiaForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarMateria();
    } else {
      this.guardarMateria();
    }
  }

  obtenerMaterias(): void {
    this.isLoading = true;
    this.materiaService.obtenerMaterias().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarMateria(): void {
    const { nombre, descripcion } = this.materiaForm.value;
    this.materiaService.guardarMateria(nombre, descripcion).subscribe({
      next: (data: any) => {
        this.obtenerMaterias();
        this.cerrarModal();
        this.alertsService.toast('Materia guardada correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarMateria(): void {
    const { nombre, descripcion } = this.materiaForm.value;
    const materiaId = this.materia.id;
    this.materiaService
      .actualizarMateria(materiaId, nombre, descripcion)
      .subscribe({
        next: (data: any) => {
          this.obtenerMaterias();
          this.cerrarModal();
          this.alertsService.toast(
            'Materia actualizada correctamente',
            'success'
          );
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  editarMateria(materia: Materia): void {
    this.isEditMode = true;
    this.materia = materia;
    this.materiaForm.patchValue({
      nombre: materia.nombre,
      descripcion: materia.descripcion,
    });
    this.abrirModal();
  }

  eliminarMateria(materia: Materia): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.materiaService.eliminarMateria(materia.id).subscribe({
          next: (data: any) => {
            this.obtenerMaterias();
            this.alertsService.toast(
              'Materia eliminada correctamente',
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
    this.materiaForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.materiaForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.materiaForm, field);
  }
}
