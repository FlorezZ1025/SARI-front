import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndicatorService {
  url = environment.API_URL;

  constructor(private _client: HttpClient, private _authService: AuthService) {}

  public getPureArticles(fullSepName: string): any {
    const url = `${this.url}/indicators/pure_articles`;

    console.log(fullSepName);
    const data = {fullname: fullSepName};

    return this._client
      .post(
        url,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthService.token}`,
          },
        }
      )
      .pipe(
        tap((response)=>{
          console.log('Response:', response);
        }),
        catchError((error) => {
          console.error('Error:', error.error.error);
          console.error('Error:', error.message);
          return of(null); // Manejo de errores
        })
      );
  }
}
