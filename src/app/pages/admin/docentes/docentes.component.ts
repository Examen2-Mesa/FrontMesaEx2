import { Component } from '@angular/core';
import { Docente } from './interfaces/docente.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocenteService } from './services/docente.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-docentes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent
],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css',
})
export class DocentesComponent {
  page: number = 1;
  limit: number = 10;

  docentes: Docente[] = [];
  todosLosDocentes: Docente[] = [];
  docente!: Docente;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  docenteForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private docenteService: DocenteService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.docenteService.docentes$.subscribe((docentes) => {
      this.docentes = docentes;
      this.todosLosDocentes = docentes; // Guardar todos los docentes para la búsqueda
    });

    this.docenteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', Validators.required],
      contrasena: [''],
    });
    this.obtenerDocentes();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las docentes
      this.docentes = [...this.todosLosDocentes];
    } else {
      // Filtrar las docentes según el nombre
      this.docentes = this.todosLosDocentes.filter((docente) =>
        docente.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarDocente();
    } else {
      this.guardarDocente();
    }
  }

  obtenerDocentes(): void {
    this.isLoading = true;
    this.docenteService.obtenerDocentes().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarDocente(): void {
    const docente: Docente = {
      ...this.docenteForm.value,
      is_doc: true,
    };
    
    this.docenteService.guardarDocente(docente).subscribe({
      next: (data: any) => {
        this.obtenerDocentes();
        this.cerrarModal();
        this.alertsService.toast('Docente guardado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarDocente(): void {
    const { contrasena, ...docente } = this.docenteForm.value;
    docente.is_doc = true;
    
    const docenteId = this.docente.id!;
    this.docenteService.actualizarDocente(docenteId, docente).subscribe({
      next: (data: any) => {
        this.obtenerDocentes();
        this.cerrarModal();
        this.alertsService.toast('Docente actualizado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarDocente(docente: Docente): void {
    this.isEditMode = true;
    this.modalVisible = true;
    this.docente = docente;
    this.docenteForm.patchValue({
      nombre: docente.nombre,
      apellido: docente.apellido,
      telefono: docente.telefono,
      correo: docente.correo,
      genero: docente.genero,
      contrasena: '',
    });
    
    // Quitar validadores de contraseña en modo edición
    this.docenteForm.get('contrasena')?.clearValidators();
    this.docenteForm.get('contrasena')?.updateValueAndValidity();
  }

  eliminarDocente(docente: Docente): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.docenteService.eliminarDocente(docente.id!).subscribe({
          next: (data: any) => {
            this.obtenerDocentes();
            this.alertsService.toast(
              'Docente eliminado correctamente',
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
    
    // Hacer el campo contraseña requerido solo en modo creación
    this.docenteForm.get('contrasena')?.setValidators([Validators.required]);
    this.docenteForm.get('contrasena')?.updateValueAndValidity();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.docenteForm.reset();
  }
  asignarMaterias(docente: Docente): void {
    this.router.navigate(['/admin/asignar-docente', docente.id]);
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.docenteForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.docenteForm, field);
  }
}
