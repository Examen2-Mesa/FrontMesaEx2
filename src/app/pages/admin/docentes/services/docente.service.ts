import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Docente } from '../interfaces/docente.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DocenteService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _docentesSubject = new Subject<Docente[]>();
  public docentes$ = this._docentesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerDocentes(): Observable<Docente[]> {
    const url = `${this.BASE_URL}/docentes/solo-docentes`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Docente[]>(url, { headers }).pipe(
      map((docentes) => docentes.sort((a, b) => a.id! - b.id!)),
      tap((docentes) => {
        this._docentesSubject.next(docentes);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los docentes');
      })
    );
  }
  
  obtenerDocentePorId(id: number): Observable<Docente> {
      const url = `${this.BASE_URL}/docentes/${id}`;
      const token = localStorage.getItem(this.TOKEN_KEY) || '';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      return this.http.get<Docente>(url, { headers }).pipe(
        catchError((error) => {
          return throwError(() => 'Error al obtener el docente');
        })
      );
    }

  guardarDocente(docente: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}/docentes/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Docente>(url, docente, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el docente');
      })
    );
  }

  actualizarDocente(id: number, docente: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}/docentes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.put<Docente>(url, docente, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el docente');
      })
    );
  }

  eliminarDocente(id: number): Observable<String> {
    const url = `${this.BASE_URL}/docentes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el docente');
      })
    );
  }
}
