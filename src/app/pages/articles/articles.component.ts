import { Component, Signal } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { IndicatorService } from '../../services/indicator.service';
import { ArticleItem } from '../../interfaces/article-item.interface';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIcon, AsyncPipe],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent {
createArticle() {
  console.log(this.loading$)
}
  user: Signal<User | null | undefined>;
  fullName: string;
  separatedFullName: string;
  loading$: any;
  articles: ArticleItem[] = [];

  constructor(
    private _client: HttpClient,
    public authService: AuthService,
    private _indicatorService: IndicatorService,
    private _router: Router,
    private _loaderService:LoaderService,
  ) {
    this.user = this.authService.currentUser;

    this.fullName = `${this.user()?.name} ${this.user()?.lastName}` || '';
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');

    this._indicatorService.articles$.subscribe(() => {
      this.articles = this._indicatorService.getArticlesFromLocalStorage();
      this.articles = this.articles.map((article) => ({...article, id: Date.now()+Math.random()}));
    });
    this._loaderService.loading$.subscribe((loading) => {
      this.loading$ = loading;
    });
  }

  formatAuthors(authors: string[]): string {
    console.log(this.loading$)
    authors = authors.map((author) => author.toLocaleLowerCase().trim());
    const uniqueAuthors = Array.from(new Set(authors));
    return uniqueAuthors.join(', ');
  }

  // trackByIndex(index: number, item: any): number {
  //   return item.id;
  // }
  extractFromPure(): void {
    console.log('entrando con el nombre: ', this.separatedFullName);
    this._indicatorService
      .getPureArticles(this.separatedFullName)
      .subscribe((response: any) => {
        alert(response.message + ' Inténtalo más tarde.');
        this._router.navigate(['/articles']);
      });
  }
}
