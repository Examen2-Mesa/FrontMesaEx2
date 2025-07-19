import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertsService } from '../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public loginForm!: FormGroup;
  public loading: boolean = false;
  public returnUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private alertServive: AlertsService,
    private validatorsService: ValidatorsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.validatorsService.emailValid]],
      password: ['', [Validators.required]],
    });

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    const correo: string = this.loginForm.value.email.trim();
    const contrasena: string = this.loginForm.value.password.trim();

    this.authService.login({ correo, contrasena }).subscribe({
      next: (response) => {
        console.log('Login response:', response.is_doc);

        if (!response.is_doc) {
          this.router.navigate([this.returnUrl ? this.returnUrl : '/admin/home']);
        } else {
          this.router.navigate([this.returnUrl ? this.returnUrl : '/docente/home']);
        }

        this.loading = false;
        this.alertServive.toast('Usuario autenticado con éxito', 'success');
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en el login:', error);
        this.alertServive.toast(
          'Credenciales inválidas. Intente nuevamente.',
          'error'
        );
      },
    });
  }

  register() {
    return this.router.navigate(['/authentication/register']);
  }

  isInvalidField(field: string): boolean | null {
    return this.validatorsService.isInvalidField(this.loginForm, field);
  }

  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.loginForm, field);
  }
}
