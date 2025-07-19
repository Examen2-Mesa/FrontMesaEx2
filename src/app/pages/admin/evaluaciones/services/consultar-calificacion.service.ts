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

  obtenerEvaluaciones(estudianteId: number, periodoId: number): Observable<CalificacionResponse[]> {
    const url = `${this.BASE_URL}/rendimientos/estudiante/${estudianteId}/periodo/${periodoId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<CalificacionResponse[]>(url, { headers }).pipe(
      // map((evaluaciones) => evaluaciones.sort((a, b) => a.id! - b.id!)),
      tap((evaluaciones) => {
        // this._evaluacionesSubject.next(evaluaciones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las evaluaciones');
      })
    );
  }

  
}
