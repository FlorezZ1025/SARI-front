import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  first,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
  timeout,
} from 'rxjs';
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
      this._userId = this._authService.currentUser()?.id;
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

  public deleteArticle(id: string): Observable<ArticlesResponse> {
    const url = `${this.url}/articles/delete`;
    const data = { id: id };
    return this._client.post(url, data).pipe(
      map(
        (response: any) =>
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

  public editArticle(article: ArticleItem): Observable<ArticlesResponse> {
    const url = `${this.url}/articles/update`;
    const data = article;
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
        articles.map((art) => {
          if (art.id === article.id) {
            art.title = article.title;
            art.authors = article.authors;
            art.date = article.date;
            art.state = article.state;
          }
          return art;
        });

        this.setArticlesInLocalStorage(articles);
        console.log('Article edited in local storage');
      }),
      catchError((error) =>
        of(error).pipe(
          tap((error) => console.error('Error:', error)),
          map(
            (error) =>
              ({
                message: error.error.message || 'Error al editar el articulo',
                statusCode: error.status || 500,
              } as ArticlesResponse)
          )
        )
      )
    );
  }

  public loadArticlesOnStart() {
    const actualArticles = this.getArticlesFromLocalStorage();
    if(actualArticles.length > 0){
      console.log('Articles loaded from local storage:', actualArticles);
      this.articleSubject.next(actualArticles);
      return of(actualArticles);
    }else{
      console.log('No articles in local storage, loading from DB...');
      return this.getArticlesFromDB()
    }
  }

  public getArticlesFromDB(): Observable<ArticleItem[]> {
    const url = `${this.url}/articles/get_all`;
    return this._client.get(url).pipe(
      map((response: any) => {
        const articles = response.data || [];
        this.setArticlesInLocalStorage(articles);
        return articles;
      }),
      catchError((error) =>
        of(error)
      )
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

  public createArticleInLocalStorage(article: ArticleItem): void {
    const articles = this.getArticlesFromLocalStorage();
    articles.push(article);
    localStorage.setItem(`articles ${this._userId}`, JSON.stringify(articles));
    this.articleSubject.next(articles);
  }

  public createArticle(
    article: ArticleItem
  ): Observable<CreateArticleResponse> {
    const url = `${this.url}/articles/create`;
    const data = article;

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
      map(
        (response: any) =>
          ({
            articles: response.data || [],
            message: response.message,
            statusCode: response.statusCode,
          } as ArticlesResponse)
      ),
      tap((response) => {
        console.log('artículos de Pure:', response.articles);
        const articles = this.getArticlesFromLocalStorage();
        const pureArticles = response.articles || [];
        if (articles.length === 0) {
          this.setArticlesInLocalStorage(pureArticles);
          console.log('Articles set in local storage_first time');
          return;
        }
        const titleArticleList = articles.map((art) => art.id);
        console.log('titleArticleList', titleArticleList);
        pureArticles.forEach((pureArt) => {
          console.log('pureArt.tittle', pureArt.title);
          if (!titleArticleList.includes(pureArt.id)) {
            console.log(!titleArticleList.includes(pureArt.id));
          }
        });
        this.setArticlesInLocalStorage(articles);
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
