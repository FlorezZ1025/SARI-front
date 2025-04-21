import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ArticleItem } from '../interfaces/article-item.interface';
import { ArticlesResponse } from '../interfaces/articles-response.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreateArticleResponse } from '../interfaces/create-article-response.interface';

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

  public deleteArticle(id: string): Observable<any> {
    const url = `${this.url}/articles/delete`;
    const data = { id: id };
    return this._client.post(url, data).pipe(
      tap((response: any) => {
        console.log('Response:', response);
      }),
      map(
        (response) =>
          ({
            message: response.message,
            statusCode: response.statusCode,
          } as ArticlesResponse)
      ),
      tap(() => {
        const articles = this.getArticlesFromLocalStorage();
        const filteredArticles = articles.filter(
          (article) => article.id !== id
        );
        this.setArticlesInLocalStorage(filteredArticles);
        console.log('Article deleted in local storage');
      }),
      catchError((error) =>
        of(error).pipe(
          tap((error) => console.error('Error:', error)),
          map(
            (error) =>
              ({
                message: error.error.message || 'Error al eliminar el articulo',
                statusCode: error.status || 500,
              } as ArticlesResponse)
          )
        )
      )
    );
  }

  setArticlesInLocalStorage(articles: ArticleItem[]): void {
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  private getArticlesFromLocalStorage(): ArticleItem[] {
    const articles = localStorage.getItem(`articles ${this._userId}`);
    return articles ? JSON.parse(articles) : [];
  }

  public createArticleInLocalStorage(article: ArticleItem): void {
    const articles = this.getArticlesFromLocalStorage();
    articles.push(article);
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  public createArticleInDB(
    article: ArticleItem
  ): Observable<CreateArticleResponse> {
    const url = `${this.url}/articles/create`;
    const data = article;
    // this.createArticleInLocalStorage(article);

    return this._client.post(url, data).pipe(
      map(
        (response: any) =>
          ({
            message: response.message,
            statusCode: response.statusCode,
            idArticle: response.idArticle,
          } as CreateArticleResponse)
      ),
      tap((response) => {
        const new_article: ArticleItem = {
          id: response.idArticle,
          title: article.title,
          authors: article.authors,
          date: article.date,
          state: article.state,
        };
        this.createArticleInLocalStorage(new_article);
        console.log('Article created in local storage');
      }),
      catchError((error) =>
        of(error).pipe(
          tap((error) => console.error('Error:', error)),
          map(
            (error) =>
              ({
                message: error.error.message || 'Error al crear el articulo',
                statusCode: error.status || 500,
              } as CreateArticleResponse)
          )
        )
      )
    );
  }

  public getPureArticles(fullSepName: string): Observable<ArticlesResponse> {
    const url = `${this.url}/articles/pure_articles`;

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
            statusCode: response.statusCode,
          } as ArticlesResponse)
      ),
      tap((response) => {
        this.setArticlesInLocalStorage(response.articles || []);
        console.log('Articles set in local storage');
      }),

      catchError((error) =>
        of(error).pipe(
          tap((error) => console.error('Error:', error)),
          map(
            (error) =>
              ({
                message:
                  error.error.message || 'Error al obtener los articulos',
                statusCode: error.status || 500,
              } as ArticlesResponse)
          )
        )
      )
    );
  }
}
