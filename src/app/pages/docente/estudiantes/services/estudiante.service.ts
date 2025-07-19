import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { Estudiante } from '../../../admin/estudiantes/interfaces/estudiante.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _estudiantesSubject = new Subject<Estudiante[]>();
  public estudiantes$ = this._estudiantesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEstudiantes(
    docenteId: number,
    cursoId: number,
    materiaId: number
  ): Observable<Estudiante[]> {
    const url = `${this.BASE_URL}/docentes/alumnos-docente/${docenteId}/curso/${cursoId}/materia/${materiaId}`;
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
}
