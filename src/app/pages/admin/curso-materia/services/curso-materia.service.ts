import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CursoMateria, CursoMateriaDetalle } from '../interfaces/curso-materia.interface';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CursoMateriaService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _detalleCursoSubject = new Subject<CursoMateriaDetalle[]>();
  public detalleCurso$ = this._detalleCursoSubject.asObservable();

  constructor(private http: HttpClient) {}
  
  obtenerMateriasPorCurso(id: number): Observable<CursoMateriaDetalle[]> {
    const url = `${this.BASE_URL}/curso-materia/materias-por-curso/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<CursoMateriaDetalle[]>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener las materias del curso');
      })
    );
  }
  
  asignarMateriaACurso(cursoId: number, materiaId: number): Observable<CursoMateria> {
    const url = `${this.BASE_URL}/curso-materia`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      curso_id: cursoId,
      materia_id: materiaId
    };
    
    return this.http.post<CursoMateria>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al asignar la materia al curso');
      })
    );
  }
  
  eliminarMateriaDeCurso(cursoMateriaId: number): Observable<String> {
    const url = `${this.BASE_URL}/curso-materia/${cursoMateriaId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la materia del curso');
      })
    );
  }
  
}
