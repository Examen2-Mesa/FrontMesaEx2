import { Component } from '@angular/core';
import { Periodo } from './interfaces/periodo.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PeriodoService } from './services/periodo.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { GestionService } from '../gestiones/services/gestion.service';
import { Gestion } from '../gestiones/interfaces/gestion.interface';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-periodos',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './periodos.component.html',
  styleUrl: './periodos.component.css',
})
export class PeriodosComponent {
  page: number = 1;
  limit: number = 10;

  gestiones: Gestion[] = [];
  periodos: Periodo[] = [];
  todosLosPeriodos: Periodo[] = [];
  periodo!: Periodo;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  periodoForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private periodoService: PeriodoService,
    private gestionService: GestionService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.gestionService.gestiones$.subscribe((gestiones) => {
      this.gestiones = gestiones;
    });

    this.periodoService.periodos$.subscribe((periodos) => {
      this.periodos = periodos;
      this.todosLosPeriodos = periodos; // Guardar todas las periodos para la búsqueda
    });

    this.periodoForm = this.fb.group({
      nombre: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      gestion_id: ['', Validators.required],
    });
    
    this.gestionService.obtenerGestiones().subscribe();
    this.obtenerPeriodos();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las periodos
      this.periodos = [...this.todosLosPeriodos];
    } else {
      // Filtrar las periodos según el nombre
      this.periodos = this.todosLosPeriodos.filter((periodo) =>
        periodo.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.periodoForm.invalid) {
      this.periodoForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarPeriodo();
    } else {
      this.guardarPeriodo();
    }
  }

  obtenerPeriodos(): void {
    this.isLoading = true;
    this.periodoService.obtenerPeriodos().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarPeriodo(): void {
    const periodo: Periodo = this.periodoForm.value;
    this.periodoService.guardarPeriodo(periodo).subscribe({
      next: (data: any) => {
        this.obtenerPeriodos();
        this.cerrarModal();
        this.alertsService.toast('Periodo guardado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarPeriodo(): void {
    const periodo: Periodo = this.periodoForm.value;
    const periodoId = this.periodo.id!;
    this.periodoService.actualizarPeriodo(periodoId, periodo).subscribe({
      next: (data: any) => {
        this.obtenerPeriodos();
        this.cerrarModal();
        this.alertsService.toast(
          'Periodo actualizado correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarPeriodo(periodo: Periodo): void {
    this.isEditMode = true;
    this.periodo = periodo;
    this.periodoForm.patchValue({
      nombre: periodo.nombre,
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      gestion_id: periodo.gestion_id,
    });
    this.abrirModal();
  }

  eliminarPeriodo(periodo: Periodo): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.periodoService.eliminarPeriodo(periodo.id!).subscribe({
          next: (data: any) => {
            this.obtenerPeriodos();
            this.alertsService.toast(
              'Periodo eliminado correctamente',
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
  
  obtenerGestion(id: number): string {
    const gestion = this.gestiones.find((gestion) => gestion.id === id);
    return gestion ? gestion.anio : '';
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.periodoForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.periodoForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.periodoForm, field);
  }
}
