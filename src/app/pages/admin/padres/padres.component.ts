import { Component, OnInit } from '@angular/core';
import {  Padre, PadreCreate, PadreUpdate, Estudiantes } from './interfaces/padres.interface';
import { PadresService } from './service/padres.service';
import { Estudiante } from '../estudiantes/interfaces/estudiante.interface';
import { EstudianteService } from '../estudiantes/services/estudiante.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-padres',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, LoadingSpinnerComponent, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './padres.component.html',
  styleUrls: ['./padres.component.css'],
})
export class PadresComponent implements OnInit {
  page: number = 1;
  limit: number = 10;

  padres: Padre[] = [];
  todosLosPadres: Padre[] = [];
  estudiantes: Estudiante[] = [];

  padreSeleccionado!: Padre | null;
  modalVisible: boolean = false;
  isEditMode: boolean = false;

  asignarHijoModalVisible: boolean = false;
  selectedEstudianteId: number | null = null;

  padreForm!: FormGroup;

  isLoading: boolean = false;

  estudianteSeleccionado: number | null = null;
  hijosAsignados: Estudiantes[] = [];
  modalAsignarVisible = false;


  constructor(
    private padreService: PadresService,
    private estudianteService: EstudianteService,
    private fb: FormBuilder,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
  ) {}

  ngOnInit(): void {
    this.padreService.padres$.subscribe((padres) => {
      this.padres = padres;
      this.todosLosPadres = [...padres]; // copia para búsquedas
    });

    this.padreForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', Validators.required],
      contrasena: [''], // requerida solo en creación
      estudiante_id: [null, Validators.required] // Agregado para ng-select
    });

    this.cargarPadres();
  }

  cargarPadres(): void {
    this.isLoading = true;
    this.padreService.obtenerPadres().subscribe({
      next: () => {},
      error: (error) => this.alertsService.toast(error, 'error'),
      complete: () => (this.isLoading = false),
    });
  }
    onSubmit(): void {
      if (this.isEditMode) {
        this.actualizarPadre();
      } else {
        this.guardarPadre();
      }
    }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase().trim();

    if (searchTerm === '') {
      this.padres = [...this.todosLosPadres];
    } else {
      this.padres = this.todosLosPadres.filter((padre) =>
        padre.nombre.toLowerCase().includes(searchTerm) ||
        padre.apellido.toLowerCase().includes(searchTerm) ||
        padre.correo.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  abrirModalCrear(): void {
    this.modalVisible = true;
    this.isEditMode = false;
    this.padreForm.reset();
    this.padreForm.get('contrasena')?.setValidators([Validators.required]);
    this.padreForm.get('contrasena')?.updateValueAndValidity();
  }

  abrirModalEditar(padre: Padre): void {
    console.log('Valor de género desde backend:', JSON.stringify(padre.genero));
    console.log('Tipo de dato:', typeof padre.genero);
    
    this.isEditMode = true;
    this.modalVisible = true;
    this.padreSeleccionado = padre;

    this.padreForm.patchValue({
      nombre: padre.nombre,
      apellido: padre.apellido,
      telefono: padre.telefono,
      correo: padre.correo,
      genero: padre.genero,
      contrasena: '',
    });

    console.log('Valor en el formulario después del patchValue:', this.padreForm.get('genero')?.value);

    this.padreForm.get('contrasena')?.clearValidators();
    this.padreForm.get('contrasena')?.updateValueAndValidity();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.padreForm.reset();
    this.padreSeleccionado = null;
  }

  guardarPadre(): void {
    if (this.padreForm.invalid) {
      this.padreForm.markAllAsTouched();
      return;
    }

    const formValue = this.padreForm.value;
    const padreData: PadreCreate = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      telefono: formValue.telefono,
      correo: formValue.correo,
      genero: formValue.genero,
      contrasena: formValue.contrasena,
      hijos_ids: [], // no asignamos hijos en creación desde aquí
    };

    this.padreService.crearPadre(padreData).subscribe({
      next: () => {
        this.alertsService.toast('Padre guardado correctamente', 'success');
        this.cargarPadres();
        this.cerrarModal();
      },
      error: (error) => this.alertsService.toast(error, 'error'),
    });
  }
    changeLimit(event: Event): void {
      const target = event.target as HTMLSelectElement;
      this.limit = Number(target.value);
      this.page = 1; // Opcional: resetear la página al cambiar el límite
    }
  actualizarPadre(): void {
    if (!this.padreSeleccionado) return;

    if (this.padreForm.invalid) {
      this.padreForm.markAllAsTouched();
      return;
    }

    const formValue = this.padreForm.value;
    const padreUpdate: PadreUpdate = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      telefono: formValue.telefono,
      correo: formValue.correo,
      genero: formValue.genero,
      // No enviamos contraseña para actualizar si está vacía
      ...(formValue.contrasena ? { contrasena: formValue.contrasena } : {}),
    };

    this.padreService.actualizarPadre(this.padreSeleccionado.id, padreUpdate).subscribe({
      next: () => {
        this.alertsService.toast('Padre actualizado correctamente', 'success');
        this.cargarPadres();
        this.cerrarModal();
      },
      error: (error) => this.alertsService.toast(error, 'error'),
    });
  }

  eliminarPadre(padre: Padre): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.padreService.eliminarPadre(padre.id!).subscribe({
          next: () => {
            this.alertsService.toast('Padre eliminado correctamente', 'success');
            this.cargarPadres();
            this.page = 1;
          },
          error: (error) => this.alertsService.toast(error, 'error'),
        });
      }
    });
  }

  


  asignarHijo(): void {
    const estudianteId = this.padreForm.get('estudiante_id')?.value;
    
    if (!this.padreSeleccionado || !estudianteId) {
      this.alertsService.toast('Seleccione un padre y un estudiante', 'error');
      return;
    }

    this.padreService.asignarHijo(this.padreSeleccionado.id, estudianteId).subscribe({
      next: () => {
        this.alertsService.toast('Hijo asignado correctamente', 'success');
        this.padreForm.get('estudiante_id')?.setValue(null); // Limpiar selección
        this.cargarHijosDelPadre(this.padreSeleccionado!.id);
      },
      error: (error) => this.alertsService.toast(error, 'error'),
    });
  }
  isValidField(field: string): boolean | null {
  return this.validatorsService.isValidField(this.padreForm, field);
}

getMessageError(field: string): string | null {
  return this.validatorsService.getErrorMessage(this.padreForm, field);
}
abrirModalAsignarHijo(padre: Padre): void {
  console.log('Abriendo modal para padre:', padre);
  this.padreSeleccionado = padre;
  this.asignarHijoModalVisible = true;
  
  // Limpiar el formulario
  this.padreForm.get('estudiante_id')?.setValue(null);

  // Cargar hijos del padre
  this.cargarHijosDelPadre(padre.id);

  // Cargar lista de estudiantes
  console.log('Cargando estudiantes...');
  this.estudianteService.obtenerEstudiantes().subscribe({
    next: (estudiantes) => {
      console.log('Estudiantes recibidos:', estudiantes);
      this.estudiantes = estudiantes.map(est => ({
        ...est,
        nombreCompleto: `${est.nombre} ${est.apellido}`
      }));
      console.log('Estudiantes procesados:', this.estudiantes);
    },
    error: (err) => {
      console.error('Error al cargar estudiantes:', err);
      this.alertsService.toast('Error al cargar estudiantes', 'error');
    }
  });
}


cerrarModalAsignarHijo(): void {
  this.asignarHijoModalVisible = false;
  this.padreSeleccionado = null;
  this.hijosAsignados = [];
}
cargarHijosDelPadre(padreId: number): void {
  console.log('Cargando hijos del padre ID:', padreId);
  this.padreService.obtenerHijosDelPadre(padreId).subscribe({
    next: (hijos) => {
      console.log('Hijos recibidos:', hijos);
      this.hijosAsignados = hijos;
    },
    error: (err) => {
      console.error('Error al cargar hijos:', err);
      this.alertsService.toast('Error al cargar hijos del padre', 'error');
    }
  });
}

eliminarHijoAsignado(hijoId: number): void {
  if (!this.padreSeleccionado) return;

  this.padreService.desasignarHijo(this.padreSeleccionado.id!, hijoId).subscribe({
    next: () => {
      this.alertsService.toast('Hijo desasignado correctamente', 'success');
      this.hijosAsignados = this.hijosAsignados.filter((hijo) => hijo.id !== hijoId);
    },
    error: (error) => this.alertsService.toast(error, 'error'),
  });
}
eliminarHijo(idHijo: number): void {
  // Aquí puedes consumir tu servicio para eliminar la relación
    if (this.padreSeleccionado) {
  this.padreService.desasignarHijo(this.padreSeleccionado.id, idHijo).subscribe({
    next: () => {
this.hijosAsignados = this.hijosAsignados.filter(h => h.id !== idHijo);
    },
    error: (err: any) => {
      console.error('Error al eliminar hijo:', err);
    }
  });
}
}
}
