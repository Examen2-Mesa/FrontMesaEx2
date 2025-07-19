import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Gestion } from '../interfaces/gestion.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GestionService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _gestionesSubject = new Subject<Gestion[]>();
  public gestiones$ = this._gestionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerGestiones(): Observable<Gestion[]> {
    const url = `${this.BASE_URL}/gestiones/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Gestion[]>(url, { headers }).pipe(
      map((gestiones) => gestiones.sort((a, b) => a.id! - b.id!)),
      tap((gestiones) => {
        this._gestionesSubject.next(gestiones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las gestiones');
      })
    );
  }

  guardarGestion(gestion: Gestion): Observable<Gestion> {
    const url = `${this.BASE_URL}/gestiones/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Gestion>(url, gestion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar la gestión');
      })
    );
  }

  actualizarGestion(id: number, gestion: Gestion): Observable<Gestion> {
    const url = `${this.BASE_URL}/gestiones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Gestion>(url, gestion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar la gestión');
      })
    );
  }

  eliminarGestion(id: number): Observable<String> {
    const url = `${this.BASE_URL}/gestiones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la gestión');
      })
    );
  }
}
