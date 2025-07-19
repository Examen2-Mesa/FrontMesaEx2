import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginRequest, LoginResponse } from '../interfaces/login.interface';
import { Usuario } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private userSubject = new BehaviorSubject<Usuario | null>(null);
  public user$ = this.userSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuthData();
  }

  // Cargar datos de autenticación desde localStorage al iniciar el servicio
  private loadStoredAuthData(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    const storedUserString = localStorage.getItem(this.USER_KEY);

    if (storedToken && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString) as Usuario;
        this.userSubject.next(storedUser);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data', error);
        this.logout();
      }
    }
  }

  // Iniciar sesión
  login(credentials: LoginRequest): Observable<LoginResponse> {
    //const url = `${this.BASE_URL}/docentes/login`;
    const url = `${this.BASE_URL}/auth/login`;

    return this.http.post<LoginResponse>(url, credentials).pipe(
      map((response) => {
        this.handleAuthSuccess(response);
        return response;
      }),
      catchError((error) => {
        console.error('Login failed: ', error.error.error);
        return throwError(
          () => new Error(error.error.message || 'Error de autenticación')
        );
      })
    );
  }

  // Manejar respuesta exitosa de autenticación
  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    this.getUser().subscribe(); // Actualizar el usuario actual
    this.isAuthenticatedSubject.next(true);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/auth/login']);
  }

  // Obtener token de autenticación
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Verificar si el token es válido y no ha expirado
  public isAuthenticated(): boolean {
    let token: any = this.getToken();

    try {
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(token);

      if (!token) {
        this.logout();
        return false;
      }

      if (
        !decodedToken ||
        decodedToken === undefined ||
        helper.isTokenExpired(token)
      ) {
        this.logout();
        return false;
      }
    } catch (error) {
      this.logout();
      return false;
    }

    return true;
  }

  // Obtener el usuario actual
  getUser(): Observable<Usuario | null> {
    const url = `${this.BASE_URL}/docentes/yo`;
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Usuario>(url, { headers }).pipe(
      map((user) => {
        console.log('User profile:', user);
        this.userSubject.next(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return user;
      }),
      catchError((error) => {
        console.error('Error fetching user profile', error);
        return of(null); // O manejar el error de otra manera
      })
    );
  }

  // Obtener el usuario actual desde el BehaviorSubject
  getCurrentUser(): Usuario | null {
    return this.userSubject.value;
  }
}
