import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Docente } from '../../docentes/interfaces/docente.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _usuariosSubject = new Subject<Docente[]>();
  public usuarios$ = this._usuariosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<Docente[]> {
    const url = `${this.BASE_URL}/docentes/solo-admins`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Docente[]>(url, { headers }).pipe(
      map((usuarios) => usuarios.sort((a, b) => a.id! - b.id!)),
      tap((usuarios) => {
        this._usuariosSubject.next(usuarios);
      }),
      catchError((error) => {
        return throwError(() => 'Error al obtener los usuarios');
      })
    );
  }

  guardarUsuario(usuario: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}/docentes/`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Docente>(url, usuario, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al guardar el usuario');
      })
    );
  }

  actualizarUsuario(id: number, usuario: Docente): Observable<Docente> {
    const url = `${this.BASE_URL}/docentes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.put<Docente>(url, usuario, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al actualizar el usuario');
      })
    );
  }

  eliminarUsuario(id: number): Observable<String> {
    const url = `${this.BASE_URL}/docentes/${id}`;
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<String>(url, { headers }).pipe(
      catchError((error) => {
        return throwError(() => 'Error al eliminar el usuario');
      })
    );
  }
}
