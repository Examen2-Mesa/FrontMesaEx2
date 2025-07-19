import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContextoDocenteService {
  setDatos(docenteId: number, cursoId: number, materiaId: number): void {
    sessionStorage.setItem('docenteId', docenteId.toString());
    sessionStorage.setItem('cursoId', cursoId.toString());
    sessionStorage.setItem('materiaId', materiaId.toString());
  }

  getDocenteId(): number | null {
    const value = sessionStorage.getItem('docenteId');
    return value ? +value : null;
  }

  getCursoId(): number | null {
    const value = sessionStorage.getItem('cursoId');
    return value ? +value : null;
  }

  getMateriaId(): number | null {
    const value = sessionStorage.getItem('materiaId');
    return value ? +value : null;
  }

  limpiarDatos(): void {
    sessionStorage.removeItem('docenteId');
    sessionStorage.removeItem('cursoId');
    sessionStorage.removeItem('materiaId');
  }
}
