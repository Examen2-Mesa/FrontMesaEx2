import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const docenteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router); 
  
  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    console.log('Usuario no autenticado, redirigiendo a login.');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  const user = authService.getCurrentUser(); 
  
  if (user && !user.is_doc) {
    // Si el usuario no es docente, redirigir a la página de admin home
    console.log('Usuario no docente, redirigiendo a admin home.');
    router.navigate(['/admin/home']);
    return false;
  }

  return true;
  
};
