import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Periodo } from '../interfaces/periodo.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _periodosSubject = new Subject<Periodo[]>();
  public periodos$ = this._periodosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPeriodos(): Observable<Periodo[]> {
    const url = `${this.BASE_URL}/periodos/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Periodo[]>(url, { headers }).pipe(
      map((periodos) => periodos.sort((a, b) => a.id! - b.id!)),
      tap((periodos) => {
        this._periodosSubject.next(periodos);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los periodos');
      })
    );
  }

  guardarPeriodo(periodo: Periodo): Observable<Periodo> {
    const url = `${this.BASE_URL}/periodos/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Periodo>(url, periodo, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el periodo');
      })
    );
  }

  actualizarPeriodo(id: number, periodo: Periodo): Observable<Periodo> {
    const url = `${this.BASE_URL}/periodos/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Periodo>(url, periodo, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el periodo');
      })
    );
  }

  eliminarPeriodo(id: number): Observable<String> {
    const url = `${this.BASE_URL}/periodos/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el periodo');
      })
    );
  }
}
