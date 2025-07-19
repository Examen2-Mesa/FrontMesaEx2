import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Inscripcion } from '../interfaces/incripcion.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _inscripcionesSubject = new Subject<Inscripcion[]>();
  public inscripciones$ = this._inscripcionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerInscripciones(): Observable<Inscripcion[]> {
    const url = `${this.BASE_URL}/inscripciones/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Inscripcion[]>(url, { headers }).pipe(
      map((inscripciones) => inscripciones.sort((a, b) => a.id! - b.id!)),
      tap((inscripciones) => {
        this._inscripcionesSubject.next(inscripciones);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las inscripciones');
      })
    );
  }

  guardarInscripcion(inscripcion: Inscripcion): Observable<Inscripcion> {
    const url = `${this.BASE_URL}/inscripciones/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Inscripcion>(url, inscripcion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar la inscripción');
      })
    );
  }

  actualizarInscripcion(id: number, inscripcion: Inscripcion): Observable<Inscripcion> {
    const url = `${this.BASE_URL}/inscripciones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Inscripcion>(url, inscripcion, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar la inscripción');
      })
    );
  }

  eliminarInscripcion(id: number): Observable<String> {
    const url = `${this.BASE_URL}/inscripciones/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la inscripción');
      })
    );
  }
}
