import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Curso } from '../interfaces/curso.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _cursosSubject = new Subject<Curso[]>();
  public cursos$ = this._cursosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerCursos(): Observable<Curso[]> {
    const url = `${this.BASE_URL}/cursos/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Curso[]>(url, { headers }).pipe(
      map((cursos) => cursos.sort((a, b) => a.id! - b.id!)),
      tap((cursos) => {
        this._cursosSubject.next(cursos);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los cursos');
      })
    );
  }

  obtenerCursoPorId(id: number): Observable<Curso> {
    const url = `${this.BASE_URL}/cursos/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Curso>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener el curso');
      })
    );
  }
  
  guardarCurso(curso:Curso): Observable<Curso> {
    const url = `${this.BASE_URL}/cursos/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Curso>(url, curso, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el curso');
      })
    );
  }

  actualizarCurso(
    id: number,
    curso: Curso
  ): Observable<Curso> {
    const url = `${this.BASE_URL}/cursos/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Curso>(url, curso, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el curso');
      })
    );
  }

  eliminarCurso(id: number): Observable<String> {
    const url = `${this.BASE_URL}/cursos/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      tap((resp) => {
        console.log(resp);
      }),
      catchError((error) => {
        console.log(error);
        return throwError(() => 'Error al eliminar el curso');
      })
    );
  }
}
