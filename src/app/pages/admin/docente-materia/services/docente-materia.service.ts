import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocenteMateria, DocenteMateriaDetalle } from '../interfaces/docente-materia.interface';

@Injectable({
  providedIn: 'root'
})
export class DocenteMateriaService {
private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _detalleSubject = new Subject<DocenteMateriaDetalle[]>();
  public detalle$ = this._detalleSubject.asObservable();

  constructor(private http: HttpClient) {}
  
  obtenerMateriasPorDocente(id: number): Observable<DocenteMateriaDetalle[]> {
    const url = `${this.BASE_URL}/asignaciones/materias-por-docente/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<DocenteMateriaDetalle[]>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al obtener las materias del docente');
      })
    );
  }
  
  asignarMateriaADocente(docenteId: number, materiaId: number): Observable<DocenteMateria> {
    const url = `${this.BASE_URL}/asignaciones`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      docente_id: docenteId,
      materia_id: materiaId
    };
    
    return this.http.post<DocenteMateria>(url, body, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al asignar la materia al docente');
      })
    );
  }
  
  eliminarMateriaDeDocente(docenteMateriaId: number): Observable<String> {
    const url = `${this.BASE_URL}/asignaciones/${docenteMateriaId}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar la materia del docente');
      })
    );
  }
}
