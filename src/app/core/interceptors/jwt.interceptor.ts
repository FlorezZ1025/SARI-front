import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { last, Observable } from 'rxjs';
import { LoginRequest } from '@core/interfaces/login-request.interface';
import { AuthService } from '@auth/services/auth.service';

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
          Authorization: `Bearer ${AuthService.token}`,
          'ngrok-skip-browser-warning': 'true',
        }
      })
    }
  //   let lastReq = cloneReq.clone({
  //     setHeaders: { 
  //       'ngrok-skip-browser-warning': 'true',
  //     }
  // })
    return next.handle(cloneReq);
  }
}
