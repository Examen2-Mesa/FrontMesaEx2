import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ListaEstudiantes } from '../interfaces/lista-estudiantes.interface';

@Injectable({
  providedIn: 'root',
})
export class ListaEstudiantesService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _estudiantesSubject = new Subject<ListaEstudiantes[]>();
  public estudiantes$ = this._estudiantesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEstudiantes(docenteId: number): Observable<ListaEstudiantes[]> {
    const url = `${this.BASE_URL}/docentes/alumnos-asignados/${docenteId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<ListaEstudiantes[]>(url, { headers }).pipe(
      map((estudiantes) =>
        estudiantes.sort((a, b) => a.estudiante.id! - b.estudiante.id!)
      ),
      tap((estudiantes) => {
        this._estudiantesSubject.next(estudiantes);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los estudiantes');
      })
    );
  }
}
