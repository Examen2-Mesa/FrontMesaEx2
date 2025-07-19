import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { TipoEvaluacion } from '../interfaces/tipo-evaluacion.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TipoEvaluacionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _tipoEvaluacionesSubject = new Subject<TipoEvaluacion[]>();
  public tipoEvaluaciones$ = this._tipoEvaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerTipoEvaluaciones(): Observable<TipoEvaluacion[]> {
    const url = `${this.BASE_URL}/tipo-evaluacion/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<TipoEvaluacion[]>(url, { headers }).pipe(
      map((tipoEvaluaciones) => tipoEvaluaciones.sort((a, b) => a.id - b.id)),
      tap((tipoEvaluaciones) => {
        this._tipoEvaluacionesSubject.next(tipoEvaluaciones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los tipo de evaluaciones');
      })
    );
  }

  guardarTipoEvaluacion(nombre: string): Observable<TipoEvaluacion> {
    const url = `${this.BASE_URL}/tipo-evaluacion/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { nombre };

    return this.http.post<TipoEvaluacion>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el tipo de evaluación');
      })
    );
  }

  actualizarTipoEvaluacion(
    id: number,
    nombre: string,
  ): Observable<TipoEvaluacion> {
    const url = `${this.BASE_URL}/tipo-evaluacion/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { nombre };

    return this.http.put<TipoEvaluacion>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el tipo de evaluación');
      })
    );
  }

  eliminarTipoEvaluacion(id: number): Observable<String> {
    const url = `${this.BASE_URL}/tipo-evaluacion/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el tipo de evaluación');
      })
    );
  }
}
