import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';
import { RegisterResponse } from '../interfaces/register-response.interfacer';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.API_URL;
  private $token: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public get token(): Observable<string> {
    return this.$token.asObservable();
  }

  constructor(private _client: HttpClient) {}

  public doLogin(user: LoginRequest): Observable<LoginResponse> {
    return this._client.post(this.url + '/auth/login', user).pipe(
      tap((response: any) => {
        console.log('Login successful');

      })
    );
  }

  // public doRegisterTest(user: User): void {
  //   console.log(user)
  //   console.log(`${user.email} ${user.password} ${user.role}`);
  // }

  public doRegister(user: User): Observable<RegisterResponse> {
    return this._client.post<RegisterResponse>(this.url + '/auth/register', user)
    .pipe(
      tap((response:any) => {
        console.log(response)
        console.log(response.status)
      }),

      map((response) => ({ 
        message: response.message,
        statusCode: response.statusCode
       } as RegisterResponse)),

      catchError((error) => of(error).pipe(

        tap((error) => console.log(error)),
        map((error) => ({ 
          message: error.error.message,
          statusCode: error.status
         } as RegisterResponse))
      ))
    );
  }
}
