import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { InformacionAcademica } from '../interfaces/boletin.interfaces';


@Injectable({
  providedIn: 'root',
})
export class BoletinService {
  private readonly BASE_URL: string = environment.baseUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private _infoSubject = new Subject<InformacionAcademica>();
  public info$ = this._infoSubject.asObservable();

  constructor(private http: HttpClient) {}

 obtenerInformacionCompleta(
  estudianteId: number,
  enviarPorCorreo: boolean = false
): Observable<InformacionAcademica> {
  const url = `${this.BASE_URL}/info-academica/estudiante-completo`;
  const token = localStorage.getItem(this.TOKEN_KEY) || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const params = new HttpParams()
    .set('estudiante_id', estudianteId.toString())
    .set('enviar_por_correo', enviarPorCorreo.toString());

  return this.http.get<InformacionAcademica>(url, { headers, params }).pipe(
    tap((info) => {
      this._infoSubject.next(info);
    }),
    catchError((error) => {
      console.error('Error al obtener información académica:', error);
      return throwError(() => 'Error al obtener la información académica');
    })
  );
}
}