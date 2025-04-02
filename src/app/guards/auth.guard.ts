import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('verificando...');


  let authService: AuthService = inject(AuthService);
  let router:Router = inject(Router);

  // If existe token en localStorage, entonces el usuario está autorizado y lo cargas en el BehaviorSubject
  // Si no existe token, entonces el usuario no está autorizado y te lleva al login
  // ¿Este guard es para el dashboard? En ese caso si te funciona de este modo. 

  const token = AuthService.token !== '';
  if (!token) {
    console.log('no autorizado');
    router.navigate(['/sign-in']);
    return false;
  }
  authService.setUser(authService.decodeToken(AuthService.token));
  
  console.log('usuario ' + authService.currentUser()?.name + ' autorizado');
  return true;
};
