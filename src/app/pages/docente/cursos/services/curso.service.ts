import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Curso } from '../../../admin/cursos/interfaces/curso.interface';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _cursosSubject = new Subject<Curso[]>();
  public cursos$ = this._cursosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerCursos(docenteId: number): Observable<Curso[]> {
    const url = `${this.BASE_URL}/docentes/cursos-docente/${docenteId}`;
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
  
}
