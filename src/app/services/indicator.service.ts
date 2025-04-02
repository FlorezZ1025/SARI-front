import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ArticleItem } from '../interfaces/article-item.interface';
import { ArticlesResponse } from '../interfaces/Articles-response.interface';

@Injectable({
  providedIn: 'root',
})
export class IndicatorService {
  url = environment.API_URL;

  constructor(private _client: HttpClient, private _authService: AuthService) {}

  setArticlesInLocalStorage(articles: ArticleItem[]): void {
    const userId = this._authService.currentUser()?.email
    localStorage.setItem(`articles ${userId}`, JSON.stringify(articles));
  }

  getArticlesFromLocalStorage(): ArticleItem[] {
    const userId = this._authService.currentUser()?.email
    const articles = localStorage.getItem(`articles ${userId}`);
    return articles ? JSON.parse(articles) : [];  
  }

  public getPureArticles(fullSepName: string): Observable<ArticlesResponse> {
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
        tap((response:any)=>{
          console.log('Response:', response);
        }),
        map((response) => ({ 
          articles: response.data,
          message: response.message,
          status: response.status,
         } as ArticlesResponse)),
         tap((response) => {
           this.setArticlesInLocalStorage(response.articles || []);
           console.log('Articles set in local storage');
         }),

        catchError((error) => 
          of(error).pipe(
            tap((error) => console.error('Error:', error)),
            map((error)=>({
              message: error.error.message || 'Error al obtener los articulos',
              status: error.status || 500,
            } as ArticlesResponse
          ))
          )
        )
      );
  }
}
