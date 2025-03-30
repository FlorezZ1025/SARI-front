import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('verificando...');

  let router:Router = inject(Router);

  const token = AuthService.token !== '';
  if (!token) {
    console.log('no autorizado');
    router.navigate(['/sign-in']);
    return false;
  }
  console.log('autorizado');
  return true;
};
