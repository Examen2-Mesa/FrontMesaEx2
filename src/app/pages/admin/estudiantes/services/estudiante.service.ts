import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Estudiante } from '../interfaces/estudiante.interface';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _estudiantesSubject = new Subject<Estudiante[]>();
  public estudiantes$ = this._estudiantesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEstudiantes(): Observable<Estudiante[]> {
    const url = `${this.BASE_URL}/estudiantes`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Estudiante[]>(url, { headers }).pipe(
      map((estudiantes) => estudiantes.sort((a, b) => a.id! - b.id!)),
      tap((estudiantes) => {
        this._estudiantesSubject.next(estudiantes);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los estudiantes');
      })
    );
  }
  
  obtenerEstudiantePorId(id: string): Observable<Estudiante> {
    const url = `${this.BASE_URL}/estudiantes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Estudiante>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener el estudiante');
      })
    );
  }

  guardarEstudiante(
    estudiante: Estudiante,
    imagen?: File
  ): Observable<Estudiante> {
    const url = `${this.BASE_URL}/estudiantes`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = new FormData();

    body.append('nombre', estudiante.nombre.trim());
    body.append('apellido', estudiante.apellido.trim());
    body.append('nombre_tutor', estudiante.nombre_tutor.trim());
    body.append('telefono_tutor', estudiante.telefono_tutor.trim());
    body.append('direccion_casa', estudiante.direccion_casa.trim());
    body.append('fecha_nacimiento', estudiante.fecha_nacimiento.toString());
    body.append('genero', estudiante.genero.trim());

    if (imagen) {
      body.append('imagen', imagen, imagen.name);
    }

    // Enviar el body en lugar del objeto estudiante
    return this.http.post<Estudiante>(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error al guardar el estudiante:', error);
        return throwError(() => 'Error al guardar el estudiante');
      })
    );
  }

  actualizarEstudiante(
    id: number,
    estudiante: Estudiante,
    imagen?: File
  ): Observable<Estudiante> {
    const url = `${this.BASE_URL}/estudiantes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = new FormData();

    body.append('nombre', estudiante.nombre.trim());
    body.append('apellido', estudiante.apellido.trim());
    body.append('nombre_tutor', estudiante.nombre_tutor.trim());
    body.append('telefono_tutor', estudiante.telefono_tutor.trim());
    body.append('direccion_casa', estudiante.direccion_casa.trim());
    body.append('fecha_nacimiento', estudiante.fecha_nacimiento.toString());
    body.append('genero', estudiante.genero.trim());
    
    if (imagen) {
      body.append('imagen', imagen, imagen.name);
    }

    return this.http.put<Estudiante>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el estudiante');
      })
    );
  }

  eliminarEstudiante(id: number): Observable<String> {
    const url = `${this.BASE_URL}/estudiantes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el estudiante');
      })
    );
  }
}
