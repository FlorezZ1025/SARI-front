import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ArticleItem } from '../interfaces/article-item.interface';
import { ArticlesResponse } from '../interfaces/articles-response.interface';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { state } from '@angular/animations';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  url = environment.API_URL;
  private _userId: string | undefined;

  private articleSubject = new BehaviorSubject<ArticleItem[]>([]);
  public articles$: Observable<ArticleItem[]> =
    this.articleSubject.asObservable();
  public currentArticles = toSignal(this.articles$);

  constructor(private _client: HttpClient, private _authService: AuthService) {
    this._authService.currentUser$.subscribe(() => {
      console.log('User changed:', this._authService.currentUser()?.name);
      this._userId = this._authService.currentUser()?.email;
      this.articleSubject.next(this.getArticlesFromLocalStorage());
    });
  }

  getCurrentArticles(): ArticleItem[] {
    return this.articleSubject.value;
  }
  deleteLastArticle(): void {
    const articles = this.getArticlesFromLocalStorage();
    if (articles.length > 0) {
      articles.pop();
      localStorage.setItem(
        `articles ${this._userId}`,
        JSON.stringify(articles)
      );
      this.articleSubject.next(articles);
    }
  }

  createArticle(article: ArticleItem): void {
    const articles = this.getArticlesFromLocalStorage();
    articles.push(article);
    localStorage.setItem(
      `articles ${this._userId}`,
      JSON.stringify(articles)
    );
    this.articleSubject.next(articles);
  }

  // sortArticlesByDate(articles: ArticleItem[]): ArticleItem[] {
  //   console.log('Sorting articles by date...');
  //   articles.sort((a, b) => {
  //     const yearA = parseInt(a.date.match(/\d{4}/)?.[0] || '0', 10);
  //     const yearB = parseInt(b.date.match(/\d{4}/)?.[0] || '0', 10);
  //     return yearB - yearA;
  //   });
  //   return articles;
  // }

  setArticlesInLocalStorage(articles: ArticleItem[]): void {
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  getArticlesFromLocalStorage(): ArticleItem[] {
    const articles = localStorage.getItem(`articles ${this._userId}`);
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
            articles: response.data || [],
            message: response.message,
            status: response.statusCode,
          } as ArticlesResponse)
      ),
      tap((response) => {
        this.setArticlesInLocalStorage(response.articles || []);
        console.log('Articles set in local storage');
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
