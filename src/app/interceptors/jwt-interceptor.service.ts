import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest } from '../interfaces/login-request.interface';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptando la peticion: ', req.url);
    let cloneReq = req.clone()
    if(!req.url.includes('login') || !req.url.includes('register')){
      cloneReq = req.clone({
        setHeaders: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthService.token}`
        }
      })
    }
    return next.handle(cloneReq);
  }
}
