import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Materia } from '../interfaces/materia.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _materiasSubject = new Subject<Materia[]>();
  public materias$ = this._materiasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerMaterias(): Observable<Materia[]> {
    const url = `${this.BASE_URL}/materias/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Materia[]>(url, { headers }).pipe(
      map((materias) => materias.sort((a, b) => a.id - b.id)),
      tap((materias) => {
        this._materiasSubject.next(materias);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las materias');
      })
    );
  }
  
  obtenerMateriaPorId(id: number): Observable<Materia> {
    const url = `${this.BASE_URL}/materias/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Materia>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener la materia');
      })
    );
  }

  guardarMateria(nombre: string, descripcion: string): Observable<Materia> {
    const url = `${this.BASE_URL}/materias/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { nombre, descripcion };

    return this.http.post<Materia>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar la materia');
      })
    );
  }

  actualizarMateria(
    id: number,
    nombre: string,
    descripcion: string
  ): Observable<Materia> {
    const url = `${this.BASE_URL}/materias/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { nombre, descripcion };

    return this.http.put<Materia>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar la materia');
      })
    );
  }

  eliminarMateria(id: number): Observable<String> {
    const url = `${this.BASE_URL}/materias/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la materia');
      })
    );
  }
  
  obtenerMateriasDelDocente(id: number): Observable<Materia[]> {
    const url = `${this.BASE_URL}/docentes/materias-docente/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Materia[]>(url, { headers }).pipe(
      map((materias) => materias.sort((a, b) => a.id - b.id)),
      tap((materias) => {
        this._materiasSubject.next(materias);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las materias del docente');
      })
    );
  }
}
