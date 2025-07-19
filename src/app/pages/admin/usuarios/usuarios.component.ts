import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from './services/usuario.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Docente } from '../docentes/interfaces/docente.interface';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, LoadingSpinnerComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {
  page: number = 1;
  limit: number = 10;

  usuarios: Docente[] = [];
  todosLosUsuarios: Docente[] = [];
  usuario!: Docente;
  modalVisible: boolean = false;
  isEditMode: boolean = false;
  usuarioForm!: FormGroup;
  
  isLoading: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private validatorsService: ValidatorsService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.usuarioService.usuarios$.subscribe((usuarios) => {
      this.usuarios = usuarios;
      this.todosLosUsuarios = usuarios; // Guardar todos los usuarios para la búsqueda
    });

    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      genero: ['', Validators.required],
      contrasena: [''],
    });
    this.obtenerUsuarios();
  }

  changeLimit(event: any): void {
    this.limit = event.target.value;
  }

  searchTable(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (searchTerm === '') {
      // Si el campo de búsqueda está vacío, mostrar todas las usuarios
      this.usuarios = [...this.todosLosUsuarios];
    } else {
      // Filtrar las usuarios según el nombre
      this.usuarios = this.todosLosUsuarios.filter((usuario) =>
        usuario.nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.page = 1;
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      this.actualizarUsuario();
    } else {
      this.guardarUsuario();
    }
  }

  obtenerUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data: any) => {},
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  guardarUsuario(): void {
    const usuario: Docente = {
      ...this.usuarioForm.value,
      is_doc: false,
    };

    this.usuarioService.guardarUsuario(usuario).subscribe({
      next: (data: any) => {
        this.obtenerUsuarios();
        this.cerrarModal();
        this.alertsService.toast('Usuario guardado correctamente', 'success');
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  actualizarUsuario(): void {
    const { contrasena, ...usuario } = this.usuarioForm.value;
    usuario.is_doc = false;

    const docenteId = this.usuario.id!;
    this.usuarioService.actualizarUsuario(docenteId, usuario).subscribe({
      next: (data: any) => {
        this.obtenerUsuarios();
        this.cerrarModal();
        this.alertsService.toast(
          'Usuario actualizado correctamente',
          'success'
        );
      },
      error: (error: any) => {
        this.alertsService.toast(error, 'error');
      },
    });
  }

  editarUsuario(usuario: Docente): void {
    this.isEditMode = true;
    this.modalVisible = true;
    this.usuario = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      correo: usuario.correo,
      genero: usuario.genero,
      contrasena: '',
    });

    // Quitar validadores de contraseña en modo edición
    this.usuarioForm.get('contrasena')?.clearValidators();
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  eliminarUsuario(usuario: Docente): void {
    this.alertsService.showConfirmationDialog().then((confirmed) => {
      if (confirmed) {
        this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
          next: (data: any) => {
            this.obtenerUsuarios();
            this.alertsService.toast(
              'Usuario eliminado correctamente',
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
    this.usuarioForm.get('contrasena')?.setValidators([Validators.required]);
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.isEditMode = false;
    this.usuarioForm.reset();
  }

  isValidField(field: string): boolean | null {
    return this.validatorsService.isValidField(this.usuarioForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.usuarioForm, field);
  }
}
