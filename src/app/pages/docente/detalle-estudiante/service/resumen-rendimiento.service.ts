import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResumenRendimiento } from '../interfaces/resumen-rendimiento.interfase';

@Injectable({
  providedIn: 'root',
})
export class ResumenRendimientoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _evaluacionesSubject = new Subject<ResumenRendimiento>();
  public evaluaciones$ = this._evaluacionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerEvaluaciones(estudianteId: number, materiaId: number): Observable<ResumenRendimiento> {
    const url = `${this.BASE_URL}/evaluaciones/resumen/por-estudiante`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const params = new URLSearchParams({
      estudiante_id: estudianteId.toString(),
      materia_id: materiaId.toString(),
    });

    const urlWithParams = `${url}?${params.toString()}`;
    
    return this.http.get<ResumenRendimiento>(urlWithParams, { headers }).pipe(
      tap((resumen: ResumenRendimiento) => {
        this._evaluacionesSubject.next(resumen);
        console.log('Resumen de rendimiento obtenido:', resumen);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las evaluaciones');
      })
    );
  }

  
}
