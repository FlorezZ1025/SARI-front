import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../interfaces/auth-response.interfacer';
import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.API_URL;

  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject
    .asObservable()
    .pipe();
  public currentUser = toSignal(this.currentUser$);

  constructor(private _client: HttpClient) {}

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public setUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  public clearUser(): void {
    this.currentUserSubject.next(null);
  }

  public setSession(token: string): void {
    localStorage.setItem('token', token);
    this.setUser(this.decodeToken(token));
  }

  public removeSession(): void {
    localStorage.removeItem('token');
    this.clearUser();
  }

  public static get token(): string {
    return localStorage.getItem('token') || '';
  }

  decodeToken(token: string) {
    try {
      const sub = jwtDecode(token).sub;
      return sub ? JSON.parse(sub) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  public doLogin(user: LoginRequest): Observable<LoginResponse | AuthResponse> {
    return this._client.post(this.url + '/auth/login', user).pipe(
     
      tap((response: any) => {
        this.setSession(response.token);
      }),
      map(
        (response) =>
          ({
            token:response.token,
            message: response.message,
            statusCode: response.statusCode,
          } as LoginResponse)
      ),

      catchError((error) =>
        of(error).pipe(
          tap((error) => console.log(error)),
          map(
            (error) =>
              ({
                message: error.error.message,
                statusCode: error.status,
              } as AuthResponse)
          )
        )
      )
    );
  }

  public doRegister(user: User): Observable<AuthResponse> {
    return this._client
      .post<AuthResponse>(this.url + '/auth/register', user)
      .pipe(
        map(
          (response) =>
            ({
              message: response.message,
              statusCode: response.statusCode,
            } as AuthResponse)
        ),
        catchError((error) =>
          of(error).pipe(
            tap((error) => console.log(error.error)),
            map(
              (error) =>
                ({
                  message: error.error.message,
                  statusCode: error.status,
                } as AuthResponse)
            )
          )
        )
      );
  }
}
