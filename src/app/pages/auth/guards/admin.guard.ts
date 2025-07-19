import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router); 
  
  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    console.log('Usuario no autenticado, redirigiendo a login.');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  const user = authService.getCurrentUser(); 
  
  if (user && user.is_doc) {
    // Si el usuario es docente, redirigir a la página de dashboard
    console.log('Usuario docente, redirigiendo a dashboard.');
    router.navigate(['/docente/home']);
    return false;
  }

  return true;
  
};
