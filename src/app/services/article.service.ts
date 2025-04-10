import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ArticleItem } from '../interfaces/article-item.interface';
import { ArticlesResponse } from '../interfaces/articles-response.interface';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { state } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  url = environment.API_URL;

  private articleSubject = new BehaviorSubject<ArticleItem[]>([]);
  articles$: Observable<ArticleItem[]>;

  constructor(private _client: HttpClient, private _authService: AuthService) {
    this.articles$ = this.articleSubject.asObservable();
  }

  deleteLastArticle(): void {
    const userId = this._authService.currentUser()?.email;
    const articles = this.getArticlesFromLocalStorage();
    if (articles.length > 0) {
      articles.pop();
      localStorage.setItem(`articles ${userId}`, JSON.stringify(articles));
      this.articleSubject.next(articles);
    }
  }

  createArticle(article: ArticleItem): void {
    const userId = this._authService.currentUser()?.email;
    const articles = this.getArticlesFromLocalStorage();
    articles.push(article);
    localStorage.setItem(`articles ${userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  setArticlesInLocalStorage(articles: ArticleItem[]): void {
    const userId = this._authService.currentUser()?.email;
    localStorage.setItem(`articles ${userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  getArticlesFromLocalStorage(): ArticleItem[] {
    const userId = this._authService.currentUser()?.email;
    const articles = localStorage.getItem(`articles ${userId}`);
    return articles ? JSON.parse(articles) : [];
  }

  public getPureArticles(fullSepName: string): Observable<ArticlesResponse> {
    const url = `${this.url}/indicators/pure_articles`;

    console.log(fullSepName);
    const data = { fullname: fullSepName };

    return this._client.post(url, data).pipe(
      tap((response: any) => {
        console.log('Response:', response);
      }),
      map(
        (response) =>
          ({
            articles: response.data?.map((article: ArticleItem) => ({
              ...article,
              id: Date.now() + (Math.random()*Math.random())*1000,
              state: 'Published',
            })),
            message: response.message,
            status: response.statusCode,
          } as ArticlesResponse)
      ),
      tap((response) => {
        this.setArticlesInLocalStorage(response.articles || []);
        console.log('Articles set in local storage');
        this.articleSubject.next(response.articles || []);
        // console.table(response.articles || []); 
      }),

      catchError((error) =>
        of(error).pipe(
          tap((error) => console.error('Error:', error)),
          map(
            (error) =>
              ({
                message:
                  error.error.message || 'Error al obtener los articulos',
                status: error.status || 500,
              } as ArticlesResponse)
          )
        )
      )
    );
  }
}
