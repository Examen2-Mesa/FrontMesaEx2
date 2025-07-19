import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { PesoTipoEvaluacion } from '../interfaces/peso-tipo-evaluacion';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PesoTipoEvaluacionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _pesosTipoEvaluacionesSubject = new Subject<PesoTipoEvaluacion[]>();
  public pesosTipoEvaluacion$ = this._pesosTipoEvaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPesoTipoEvaluaciones(docenteId: number): Observable<PesoTipoEvaluacion[]> {
    const url = `${this.BASE_URL}/pesos-evaluacion/por-docente/${docenteId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<PesoTipoEvaluacion[]>(url, { headers }).pipe(
      map((pesosTipoEvaluacion) => pesosTipoEvaluacion.sort((a, b) => a.id! - b.id!)),
      tap((pesosTipoEvaluacion) => {
        this._pesosTipoEvaluacionesSubject.next(pesosTipoEvaluacion);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los tipo de evaluaciones');
      })
    );
  }

  guardarPesoTipoEvaluacion(data: PesoTipoEvaluacion): Observable<PesoTipoEvaluacion> {
    const url = `${this.BASE_URL}/pesos-evaluacion/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<PesoTipoEvaluacion>(url, data, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el peso tipo de evaluación');
      })
    );
  }

  actualizarPesoTipoEvaluacion(
    id: number,
    data: PesoTipoEvaluacion
  ): Observable<PesoTipoEvaluacion> {
    const url = `${this.BASE_URL}/pesos-evaluacion/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<PesoTipoEvaluacion>(url, data, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el peso tipo de evaluación');
      })
    );
  }

  eliminarPesoTipoEvaluacion(id: number): Observable<String> {
    const url = `${this.BASE_URL}/pesos-evaluacion/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el peso tipo de evaluación');
      })
    );
  }
}
