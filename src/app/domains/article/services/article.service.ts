import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { environment } from '@config/environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ArticleItem } from '@core/interfaces/article-item.interface';
import { ArticlesResponse } from '@core/interfaces/articles-response.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreateArticleResponse } from '@core/interfaces/create-article-response.interface';

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

  constructor(
    private _client: HttpClient,
    private _authService: AuthService
  ) {
    this._authService.currentUser$.subscribe(() => {
      console.log('User changed:', this._authService.currentUser()?.name);
      if (AuthService.token === '') {
        this.setEmptyArticles();
        return;
      }
      this._userId = this._authService.currentUser()?.id;
    });
  }

  getCurrentArticles(): ArticleItem[] {
    return this.articleSubject.value;
  }

  public setEmptyArticles(): void {
    this.articleSubject.next([]);
  }

  public deleteArticle(id: string): Observable<ArticlesResponse> {
    const url = `${this.url}/articles/delete`;
    const data = { id: id };
    return this._client.post<ArticlesResponse>(url, data).pipe(
      map(
        response =>
          ({
            message: response.message,
            statusCode: response.statusCode,
          }) as ArticlesResponse
      ),
      tap(() => {
        const articles = this.getArticlesFromLocalStorage();
        const filteredArticles = articles.filter(article => article.id !== id);
        this.setArticlesInLocalStorage(filteredArticles);
        console.log('Article deleted in local storage');
      }),
      catchError(error =>
        of(error).pipe(
          map(
            error =>
              ({
                message: error.error.message || 'Error al eliminar el articulo',
                statusCode: error.status || 500,
              }) as ArticlesResponse
          )
        )
      )
    );
  }

  public editArticle(articleData: FormData): Observable<CreateArticleResponse> {
    const url = `${this.url}/articles/update`;
    const data = articleData;
    return this._client.post<CreateArticleResponse>(url, data).pipe(
      tap(response => {
        const articles = this.getArticlesFromLocalStorage();
        articles.map(art => {
          if (art.id === (articleData.get('id') as string)) {
            art.title = articleData.get('title') as string;
            art.authors = JSON.parse(articleData.get('authors') as string);
            art.date = articleData.get('date') as string;
            art.state = articleData.get('state') as string;
            if (response.evidenceUrl) {
              art.evidenceUrl = response.evidenceUrl;
            }
          }
          return art;
        });

        this.setArticlesInLocalStorage(articles);
        console.log('Article edited in local storage');
      }),
      catchError(error =>
        of(error).pipe(
          tap(error => console.error('Error:', error)),
          map(
            error =>
              ({
                message: error.error.message || 'Error al editar el articulo',
                statusCode: error.status || 500,
              }) as ArticlesResponse
          )
        )
      )
    );
  }

  public loadArticlesOnStart(): Observable<ArticleItem[]> {
    const actualArticles = this.getArticlesFromLocalStorage();
    if (actualArticles.length > 0) {
      this.articleSubject.next(actualArticles);
      return of(actualArticles);
    } else {
      console.log('No articles in local storage, loading from DB...');
      return this.getArticlesFromDB();
    }
  }

  public getArticlesFromDB(): Observable<ArticleItem[]> {
    const url = `${this.url}/articles/get_all`;
    return this._client.get<ArticleItem[]>(url).pipe(
      map(responseArticles => {
        const articles = responseArticles;
        this.setArticlesInLocalStorage(articles);
        return articles;
      }),
      catchError(error => of(error))
    );
  }

  private setArticlesInLocalStorage(articles: ArticleItem[]): void {
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  private getArticlesFromLocalStorage(): ArticleItem[] {
    const articles = localStorage.getItem(`articles ${this._userId}`);
    return articles ? JSON.parse(articles) : [];
  }

  private createArticleInLocalStorage(article: ArticleItem): void {
    const articles = this.getArticlesFromLocalStorage();
    articles.push(article);
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  public createArticle(
    articleData: FormData
  ): Observable<CreateArticleResponse> {
    const url = `${this.url}/articles/create`;

    return this._client.post<CreateArticleResponse>(url, articleData).pipe(
      tap(response => {
        const new_article: ArticleItem = {
          id: response.idArticle,
          title: articleData.get('title') as string,
          authors: JSON.parse(articleData.get('authors') as string),
          date: articleData.get('date') as string,
          state: articleData.get('state') as string,
          evidenceUrl: response.evidenceUrl,
        };
        this.createArticleInLocalStorage(new_article);
        console.log('Article created in local storage');
      }),
      catchError(error =>
        of(error).pipe(
          tap(error => console.error('Error:', error)),
          map(
            error =>
              ({
                message: error.error.message || 'Error al crear el articulo',
                statusCode: error.status || 500,
              }) as CreateArticleResponse
          )
        )
      )
    );
  }

  public getPureArticles(): Observable<ArticlesResponse> {
    const url = `${this.url}/articles/pure_articles`;
    const fullName = this._authService.fullSepName;
    const data = { fullname: fullName };

    return this._client.post<ArticlesResponse>(url, data).pipe(
      map(response => ({
        articles: response.articles,
        message: response.message,
        statusCode: response.statusCode,
      })),
      tap(response => this.updateLocalStorage(response.articles)),
      catchError(error => {
        console.error('Error:', error);
        return of({
          message: error.error?.message || 'Error al obtener los artículos',
          statusCode: error.status || 500,
          articles: [],
        });
      })
    );
  }

  private updateLocalStorage(pureArticles: ArticleItem[] = []) {
    const currentArticles = this.getArticlesFromLocalStorage();

    if (currentArticles.length === 0) {
      this.setArticlesInLocalStorage(pureArticles);
      return;
    }

    const existingIds = currentArticles.map(art => art.id);
    const newArticles = pureArticles.filter(
      article => !existingIds.includes(article.id)
    );

    if (newArticles.length > 0) {
      this.setArticlesInLocalStorage([...currentArticles, ...newArticles]);
    }
  }

  public addArticleHyperlink(article: ArticleItem, hyperlink: string) {
    const url = `${this.url}/articles/add_hyperlink`;
    const data = {
      id: article.id,
      hyperlink: hyperlink,
    };
    return this._client.post<string>(url, data).pipe(
      tap(articleId => {
        const articles = this.getArticlesFromLocalStorage();
        const articleToUpdate = articles.find(art => art.id === articleId);
        if (articleToUpdate) {
          articleToUpdate.hyperlink = hyperlink;
          articleToUpdate.editedLink = true;
          this.setArticlesInLocalStorage(articles);
        }
      }),
      catchError(error => {
        console.error('Error:', error);
        return of(error);
      })
    );
  }
}
