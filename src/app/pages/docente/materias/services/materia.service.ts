import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Materia } from '../interfaces/materia.interface';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _materiasSubject = new Subject<Materia[]>();
  public materias$ = this._materiasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerMaterias(id: number): Observable<Materia[]> {
    const url = `${this.BASE_URL}/curso-materia/materias-docente/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Materia[]>(url, { headers }).pipe(
      map((materias) => materias.sort((a, b) => a.materia_id - b.materia_id)),
      tap((materias) => {
        this._materiasSubject.next(materias);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener las materias del docente');
      })
    );
  }
}
