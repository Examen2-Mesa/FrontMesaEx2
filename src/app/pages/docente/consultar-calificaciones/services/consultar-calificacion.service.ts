import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalificacionResponse } from '../interfaces/calificacion-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ConsultarCalificacionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  // private _evaluacionesSubject = new Subject<Evaluacion[]>();
  // public evaluaciones$ = this._evaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEvaluaciones(estudianteId: number, materiaId: number, periodoId: number): Observable<CalificacionResponse> {
    const url = `${this.BASE_URL}/evaluaciones/resumen/por-estudiante-periodo-definitivo`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const params = new URLSearchParams({
      estudiante_id: estudianteId.toString(),
      materia_id: materiaId.toString(),
      periodo_id: periodoId.toString(),
    });

    const urlWithParams = `${url}?${params.toString()}`;
    
    return this.http.get<CalificacionResponse>(urlWithParams, { headers }).pipe(
      // map((evaluaciones) => evaluaciones.sort((a, b) => a.id! - b.id!)),
      tap((evaluaciones) => {
        // this._evaluacionesSubject.next(evaluaciones);
        console.log('Evaluaciones obtenidas:', evaluaciones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las evaluaciones');
      })
    );
  }

  
}
