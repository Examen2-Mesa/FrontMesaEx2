import { Component } from '@angular/core';
import { Gestion } from './interfaces/gestion.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GestionService } from './services/gestion.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-gestiones',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './gestiones.component.html',
  styleUrl: './gestiones.component.css',
})
export class GestionesComponent {
  page: number = 1;
  limit: number = 10;

  gestiones: Gestion[] = [];
  todasLasGestiones: Gestion[] = [];
  gestion!: Gestion;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  gestionForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private gestionService: GestionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.gestionService.gestiones$.subscribe((gestiones) => {
      this.gestiones = gestiones;
      this.todasLasGestiones = gestiones; // Guardar todas las gestiones para la búsqueda
    });

    this.gestionForm = this.fb.group({
      anio: ['', Validators.required],
      descripcion: ['', Validators.required],
    });
    this.obtenerGestiones();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las gestiones
      this.gestiones = [...this.todasLasGestiones];
    } else {
      // Filtrar las gestiones según el nombre
      this.gestiones = this.todasLasGestiones.filter((gestion) =>
        gestion.anio.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.gestionForm.invalid) {
      this.gestionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarGestion();
    } else {
      this.guardarGestion();
    }
  }

  obtenerGestiones(): void {
    this.isLoading = true;
    this.gestionService.obtenerGestiones().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarGestion(): void {
    const gestion: Gestion = this.gestionForm.value;
    this.gestionService.guardarGestion(gestion).subscribe({
      next: (data: any) => {
        this.obtenerGestiones();
        this.cerrarModal();
        this.alertsService.toast('Gestión guardada correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarGestion(): void {
    const gestion: Gestion = this.gestionForm.value;
    const gestionId = this.gestion.id!;
    this.gestionService.actualizarGestion(gestionId, gestion).subscribe({
      next: (data: any) => {
        this.obtenerGestiones();
        this.cerrarModal();
        this.alertsService.toast(
          'Gestión actualizada correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarGestion(gestion: Gestion): void {
    this.isEditMode = true;
    this.gestion = gestion;
    this.gestionForm.patchValue({
      anio: gestion.anio,
      descripcion: gestion.descripcion,
    });
    this.abrirModal();
  }

  eliminarGestion(gestion: Gestion): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.gestionService.eliminarGestion(gestion.id!).subscribe({
          next: (data: any) => {
            this.obtenerGestiones();
            this.alertsService.toast(
              'Gestión eliminada correctamente',
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
    this.gestionForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.gestionForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.gestionForm, field);
  }
}
