import { Component, inject, Signal } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article.service';
import { ArticleItem } from '../../interfaces/article-item.interface';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '../../services/loader.service';
import { ModalService } from '../../services/modal.service';
import { ModalComponent } from '../../components/article-modal/article-modal.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIcon, AsyncPipe],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent {

  user: Signal<User | null | undefined>;
  fullName: string;
  separatedFullName: string;
  loading$: any;
  articles: ArticleItem[] = [];

  private readonly _modalSvc = inject(ModalService)

  constructor(
    private _client: HttpClient,
    public authService: AuthService,
    private _articleService: ArticleService,
    private _router: Router,
    private _loaderService:LoaderService,
  ) {
    this.user = this.authService.currentUser;

    this.fullName = `${this.user()?.name} ${this.user()?.lastName}` || '';
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');

    this._articleService.articles$.subscribe(() => {
      this.articles = this._articleService.getArticlesFromLocalStorage();
      this.articles = this.articles.map((article) => ({...article, id: Date.now()+Math.random()}));
    });
    this._loaderService.loading$.subscribe((loading) => {
      this.loading$ = loading;
    });
  }
  createArticle() {
    this._modalSvc.openModal<ModalComponent, ArticleItem>(ModalComponent)
  }

  formatAuthors(authors: string[]): string {
    console.log(this.loading$)
    authors = authors.map((author) => author.toLocaleLowerCase().trim());
    const uniqueAuthors = Array.from(new Set(authors));
    return uniqueAuthors.join(', ');
  }
  deleteLastOne():void{
    this._articleService.deleteLastArticle();
  }
  
  extractFromPure(): void {
    console.log('entrando con el nombre: ', this.separatedFullName);
    this._articleService
      .getPureArticles(this.separatedFullName)
      .subscribe((response: any) => {
        if (response.status === 200) {
          alert(response.message);
        }else{
          alert('Error: ' + response.message + ' inténtalo más tarde');
        }
      });
  }
}
