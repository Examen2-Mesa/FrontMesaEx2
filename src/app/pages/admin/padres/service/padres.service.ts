import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Padre, PadreCreate, PadreUpdate, Estudiantes } from '../interfaces/padres.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PadresService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _padresSubject = new Subject<Padre[]>();
  public padres$ = this._padresSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPadres(): Observable<Padre[]> {
    const url = `${this.BASE_URL}/padres/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Padre[]>(url, { headers }).pipe(
      map((padres) => padres.sort((a, b) => a.id! - b.id!)),
      tap((padres) => this._padresSubject.next(padres)),
      catchError(() => throwError(() => 'Error al obtener los padres'))
    );
  }

  crearPadre(padre: PadreCreate): Observable<Padre> {
    const url = `${this.BASE_URL}/padres/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Padre>(url, padre, { headers }).pipe(
      catchError(() => throwError(() => 'Error al crear el padre'))
    );
  }

  actualizarPadre(id: number, padre: PadreUpdate): Observable<Padre> {
    const url = `${this.BASE_URL}/padres/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Padre>(url, padre, { headers }).pipe(
      catchError(() => throwError(() => 'Error al actualizar el padre'))
    );
  }

  eliminarPadre(id: number): Observable<string> {
    const url = `${this.BASE_URL}/padres/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<string>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al eliminar el padre'))
    );
  }

  obtenerHijosDelPadre(padreId: number): Observable<Estudiantes[]> {
    const url = `${this.BASE_URL}/padres/${padreId}/hijos`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Estudiantes[]>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al obtener los hijos del padre'))
    );
  }

  asignarHijo(padreId: number, estudianteId: number): Observable<{ mensaje: string }> {
    const url = `${this.BASE_URL}/padres/${padreId}/hijos/${estudianteId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<{ mensaje: string }>(url, null, { headers }).pipe(
      catchError(() => throwError(() => 'Error al asignar hijo al padre'))
    );
  }

  desasignarHijo(padreId: number, estudianteId: number): Observable<{ mensaje: string }> {
    const url = `${this.BASE_URL}/padres/${padreId}/hijos/${estudianteId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<{ mensaje: string }>(url, { headers }).pipe(
      catchError(() => throwError(() => 'Error al desasignar hijo del padre'))
    );
  }
  
}
