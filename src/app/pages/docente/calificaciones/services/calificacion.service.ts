import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Evaluacion } from '../interfaces/evaluacion.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CalificacionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _evaluacionesSubject = new Subject<Evaluacion[]>();
  public evaluaciones$ = this._evaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEvaluaciones(docenteId: number): Observable<Evaluacion[]> {
    const url = `${this.BASE_URL}/evaluaciones/por-docente/${docenteId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Evaluacion[]>(url, { headers }).pipe(
      map((evaluaciones) => evaluaciones.sort((a, b) => a.id! - b.id!)),
      tap((evaluaciones) => {
        this._evaluacionesSubject.next(evaluaciones);
        console.log('Evaluaciones obtenidas:', evaluaciones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las evaluaciones');
      })
    );
  }

  guardarEvaluacion(evaluacion: Evaluacion): Observable<Evaluacion> {
    const url = `${this.BASE_URL}/evaluaciones/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Evaluacion>(url, evaluacion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar la evaluación');
      })
    );
  }

  actualizarEvaluacion(
    id: number,
    evaluacion: Evaluacion
  ): Observable<Evaluacion> {
    const url = `${this.BASE_URL}/evaluaciones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Evaluacion>(url, evaluacion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar la evaluación');
      })
    );
  }

  eliminarEvaluacion(id: number): Observable<String> {
    const url = `${this.BASE_URL}/evaluaciones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la evaluación');
      })
    );
  }
}
