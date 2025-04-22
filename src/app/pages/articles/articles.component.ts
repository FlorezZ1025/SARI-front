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
import { ArticleGroup } from '../../interfaces/article-group.interface';
import { HotToastService } from '@ngneat/hot-toast';
import { EditArticleModalComponent } from '../../components/edit-article-modal/edit-article-modal.component';

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
  groupedArticles: ArticleGroup[] = [];
  sortedYears: string[] = [];

  private readonly _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private _authService = inject(AuthService);
  private _articleService = inject(ArticleService);
  private _loaderService = inject(LoaderService);

  constructor(private _router: Router) {
    this.user = this._authService.currentUser;

    this.fullName = `${this.user()?.name} ${this.user()?.lastName}` || '';
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');

    this._articleService.articles$.subscribe(() => {
      this.articles = this._articleService.getCurrentArticles();
      this.groupedArticles = this.groupArticlesByYear(this.articles);
      this.sortedYears = this.groupedArticles.map((group) => group.year);
    });
    this._loaderService.loading$.subscribe((loading) => {
      this.loading$ = loading;
    });
  }

  groupArticlesByYear(articles: ArticleItem[]): ArticleGroup[] {
    const map = new Map<string, ArticleItem[]>();

    articles.forEach((item) => {
      const year = item.date.match(/\d{4}/)?.[0];
      if (year) {
        if (!map.has(year)) {
          map.set(year, []);
        }
        map.get(year)?.push(item);
      }
    });

    const groups: ArticleGroup[] = Array.from(map.entries())
      .map(([year, articles]) => ({ year, articles }))
      .sort((a, b) => +b.year - +a.year); // ordena por año descendente

    return groups;
  }

  createArticle() {
    this._modalSvc.openModal<ModalComponent, ArticleItem>(ModalComponent);
  }

  formatAuthors(authors: string[]): string {
    authors = authors.map((author) => author.toLocaleLowerCase().trim());
    const uniqueAuthors = Array.from(new Set(authors));
    return uniqueAuthors.join(', ');
  }
  deleteLastOne(): void {
    this._articleService.deleteLastArticle();
  }

  extractFromPure(): void {
    console.log('entrando con el nombre: ', this.separatedFullName);
    this._articleService
      .getPureArticles(this.separatedFullName)
      .subscribe((response: any) => {
        if (response.statusCode === 200) {
          this._toast.success('Articulos extraidos correctamente', {
            style: {
              background: '#4caf50',
            },
          });
        } else {
          this._toast.error(
            'Error extrayendo' + ' inténtalo más tarde',
            {
              style: {
                color: '#000',
                padding: '20px',
                fontSize: '20px',
                background: '#f44336',
              },
            }
          );
        }
      });
  }

  deleteArticle(article:ArticleItem): void {
    this._articleService.deleteArticle(article.id || '').subscribe((response:any) => {
      if (response.statusCode === 200) {
        this._toast.success('Artículo eliminado correctamente', {
          style: {
            background: '#4caf50',
            padding: '20px',
            fontSize: '20px',
          },
        });
      } else {
        this._toast.error(response.message, {
          style: {
            background: '#f44336',
            padding: '20px',
            fontSize: '20px',
          },
        });
      }
    })
  }
    editArticle(article: ArticleItem) {
      this._modalSvc.openModal<EditArticleModalComponent, ArticleItem>(EditArticleModalComponent, article)
    }
}
