import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize, Observable } from 'rxjs'; 

@Injectable()
export class loaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
  }

  return next(req).pipe(
    finalize(()=>{this.loaderService.hide()})
  );
};
