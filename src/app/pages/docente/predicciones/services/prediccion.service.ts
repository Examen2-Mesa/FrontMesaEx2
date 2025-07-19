import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Prediccion } from '../interfaces/prediccion.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrediccionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) { }

  generarPrediccionPorGestion(estudianteId: number, materiaId: number, gestionId: number): Observable<Prediccion> {
    const url = `${this.BASE_URL}/ml/generar-predicciones-gestion`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      estudiante_id: estudianteId,
      materia_id: materiaId,
      gestion_id: gestionId
    }

    return this.http.post<Prediccion>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener la predicción');
      })
    );
  }

  obtenerPrediccionPorGestion(estudianteId: number, materiaId: number, gestionId: number): Observable<Prediccion> {
    const url = `${this.BASE_URL}/ml/predicciones-completas`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params = {
      estudiante_id: estudianteId,
      materia_id: materiaId,
      gestion_id: gestionId,
    };

    return this.http.get<Prediccion>(url, { headers, params }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener la predicción');
      })
    );
  }


}
