import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly ORIGEN_KEY = 'navigation_origen';
  private origen: string | null = null;

  constructor() {
    const storedOrigen = localStorage.getItem(this.ORIGEN_KEY);
    this.origen = storedOrigen ? storedOrigen : null;
  }

  // Guardar el origen
  setOrigen(origen: string): void {
    this.origen = origen;
    localStorage.setItem(this.ORIGEN_KEY, origen);
  }

  // Obtener el origen
  getOrigen(): string | null {
    return this.origen;
  }

  // Limpiar el origen
  clearOrigen(): void {
    this.origen = null;
    localStorage.removeItem(this.ORIGEN_KEY);
  }
  
}