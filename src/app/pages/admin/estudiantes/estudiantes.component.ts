import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { Estudiante } from './interfaces/estudiante.interface';
import { EstudianteService } from './services/estudiante.service';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

const IMAGE_PREVIEW: string = '/assets/img/image-placeholder.png';

@Component({
  selector: 'app-estudiantes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent
],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css',
})
export class EstudiantesComponent {
  page: number = 1;
  limit: number = 10;

  estudiantes: Estudiante[] = [];
  todosLosEstudiantes: Estudiante[] = [];
  estudiante!: Estudiante;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  estudianteForm!: FormGroup;

  imagePreview!: string;
  imagen?: File;
  isLoading: boolean = false;

  constructor(
    private estudianteService: EstudianteService,
    private alertsService: AlertsService,
    private validatorsService: ValidatorsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadImagePreview();

    this.estudianteService.estudiantes$.subscribe((estudiantes) => {
      this.estudiantes = estudiantes;
      this.todosLosEstudiantes = estudiantes; // Guardar todos los estudiantes para la búsqueda
    });

    this.estudianteForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      nombre_tutor: ['', [Validators.required]],
      telefono_tutor: ['', [Validators.required]],
      direccion_casa: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      url_imagen: [''],
    });

    this.obtenerEstudiantes();
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
        (estudiante) =>
          estudiante.nombre.toLowerCase().includes(searchTerm) ||
          estudiante.apellido.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  obtenerEstudiantes(): void {
    this.isLoading = true;
    this.estudianteService.obtenerEstudiantes().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarEstudiante(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }

    const estudiante = this.estudianteForm.value;
    this.estudianteService
      .guardarEstudiante(estudiante, this.imagen)
      .subscribe({
        next: (data: any) => {
          this.alertsService.toast('Estudiante guardado con éxito', 'success');
          this.obtenerEstudiantes();
          this.cerrarModal();
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  editarEstudiante(estudiante: Estudiante): void {
    this.isEditMode = true;
    this.estudiante = estudiante;
    this.estudianteForm.reset({
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      fecha_nacimiento: estudiante.fecha_nacimiento,
      genero: estudiante.genero,
      nombre_tutor: estudiante.nombre_tutor,
      telefono_tutor: estudiante.telefono_tutor,
      direccion_casa: estudiante.direccion_casa,
    });

    this.imagePreview = estudiante.url_imagen || IMAGE_PREVIEW;
    this.abrirModal();
  }

  actualizarEstudiante(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }

    const estudiante = this.estudianteForm.value;
    this.estudianteService
      .actualizarEstudiante(this.estudiante.id!, estudiante, this.imagen)
      .subscribe({
        next: (data: any) => {
          this.alertsService.toast(
            'Estudiante actualizado con éxito',
            'success'
          );
          this.obtenerEstudiantes();
          this.cerrarModal();
        },
        error: (error: any) => {
          this.alertsService.toast(error, 'error');
        },
      });
  }

  eliminarEstudiante(estudiante: Estudiante): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.estudianteService.eliminarEstudiante(estudiante.id!).subscribe({
          next: (data: any) => {
            this.obtenerEstudiantes();
            this.alertsService.toast(
              'Estudiante eliminado correctamente',
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

  onSubmit(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.actualizarEstudiante();
    } else {
      this.guardarEstudiante();
    }
  }

  loadImagePreview(): void {
    this.imagePreview = IMAGE_PREVIEW;
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.imagen = file;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
    }
  }

  onDeleteImage(): void {
    this.imagePreview = IMAGE_PREVIEW;
    this.imagen = undefined;
    this.estudianteForm.patchValue({ url_imagen: '' });
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;

    this.estudianteForm.reset({
      nombres: '',
      apellido: '',
      fecha_nacimiento: '',
      genero: '',
    });
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.estudianteForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.estudianteForm, field);
  }
}
