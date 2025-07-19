import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../pages/auth/services/auth.service';
import { Usuario } from '../../../pages/auth/interfaces/usuario.interface';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  usuarioActual: Usuario | null = null;
  imageUrl: string = 'assets/img/profile-img.jpg'; // Default image URL  

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((usuario) => {
      console.log('Usuario actual:', usuario);
      this.usuarioActual = usuario;
      // if (usuario && usuario.url_imagen) {
      //   this.imageUrl = usuario.url_imagen; // Update image URL if available
      // }
    });
  }

  onToggleSidebar() {
    document.body.classList.toggle('toggle-sidebar');
  }
  
  logout() {
    this.authService.logout();
  }
}
