import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../interfaces/auth-response.interfacer';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.API_URL;

  public setSession(token: string): void {
    localStorage.setItem('token', token);
  }

  public static get token(): string {
    return localStorage.getItem('token') || '';
  }

  constructor(private _client: HttpClient) {}

  public doLogin(user: LoginRequest): Observable<LoginResponse | AuthResponse> {
    return this._client.post(this.url + '/auth/login', user).pipe(
      
      tap((response: any) => {
        console.log(response);
        this.setSession(response.token);
      }),
      map((response) => ({
          message: response.message,
          user: {
            email: response.message,
            name: response.name,
            lastName: response.lastName,
            role: response.role
          } as User,
          statusCode: response.statusCode,
          } as LoginResponse

        )),


      catchError((error) => of(error).pipe(
          tap((error) => console.log(error)),
          map((error) => ({
            message: error.error.message,
            statusCode: error.status
          } as AuthResponse)
          )
      ))
    
    )
  }

  public doRegister(user: User): Observable<AuthResponse> {
    return this._client.post<AuthResponse>(this.url + '/auth/register', user)
    .pipe(
      map((response) => ({ 
        message: response.message,
        statusCode: response.statusCode
       } as AuthResponse)),
      catchError((error) => of(error).pipe(

        tap((error) => console.log(error.error)),
        map((error) => ({ 
          message: error.error.message,
          statusCode: error.status
         } as AuthResponse))
      ))
    );
  }
}
