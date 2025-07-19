import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { Usuario } from '../../pages/auth/interfaces/usuario.interface';
import { AuthService } from '../../pages/auth/services/auth.service';
import { SidebarDocenteComponent } from './sidebar-docente/sidebar-docente.component';

@Component({
  selector: 'app-full',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SidebarDocenteComponent,
  ],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css',
})
export class FullComponent {
  usuarioActual: Usuario | null = null;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });
  }
}
