import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private _client: HttpClient) {}

  public login(user: User):Observable<User>{
    return this._client.post<User>('http://localhost:3000/login', user).pipe(
      
    );
    

}}
