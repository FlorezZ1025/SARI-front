/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let cloneReq = req.clone();

    if (!req.url.includes('login') || !req.url.includes('register')) {
      const headers: any = {
        Authorization: `Bearer ${AuthService.token}`,
        'ngrok-skip-browser-warning': 'true',
      };
      if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      cloneReq = req.clone({ setHeaders: headers });
    }
    return next.handle(cloneReq);
  }
}
