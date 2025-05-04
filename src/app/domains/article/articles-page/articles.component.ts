import { Component, inject, OnInit, Signal } from '@angular/core';
import { User } from '@core/interfaces/user.interface';
import { AuthService } from '@auth/services/auth.service';
import { ArticleService } from '@articles/services/article.service';
import { ArticleItem } from '@core/interfaces/article-item.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '@core/services/loader.service';
import { ModalService } from '@core/services/modal.service';
import { CreateArticleModalComponent } from '@articles/components/create-article-modal/article-modal.component';
import { ArticleGroup } from '@core/interfaces/article-group.interface';
import { HotToastService } from '@ngneat/hot-toast';
import { EditArticleModalComponent } from '@articles/components/edit-article-modal/edit-article-modal.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIcon],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent implements OnInit {
  user: Signal<User | null | undefined>;
  fullName: string;
  separatedFullName: string;
  loading$ = false;
  articles: ArticleItem[] = [];
  groupedArticles: ArticleGroup[] = [];
  sortedYears: string[] = [];

  private readonly _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private _authService = inject(AuthService);
  private _articleService = inject(ArticleService);
  private _loaderService = inject(LoaderService);
  oe = '';

  constructor() {
    this.user = this._authService.currentUser;

    this.fullName = `${this.user()?.name} ${this.user()?.lastName}`;
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');

    this._articleService.articles$.subscribe(() => {
      this.articles = this._articleService.getCurrentArticles();
      this.groupedArticles = this.groupArticlesByYear(this.articles);
      this.sortedYears = this.groupedArticles.map(group => group.year);
    });
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
  }

  ngOnInit(): void {
    if (this._articleService.getCurrentArticles().length === 0) {
      this._articleService.loadArticlesOnStart().subscribe({
        // next: () => {},
        error: () => {
          this._toast.error('Error cargando artículos', {
            style: {
              border: '2px solid #f44336',
              // padding: '20px',
              // fontSize: '20px',
            },
          });
        },

      });
    }
  }
  groupArticlesByYear(articles: ArticleItem[]): ArticleGroup[] {
    const map = new Map<string, ArticleItem[]>();

    articles.forEach(item => {
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
    this._modalSvc.openModal<CreateArticleModalComponent, ArticleItem>(
      CreateArticleModalComponent
    );
  }

  formatAuthors(authors: string[]): string {
    authors = authors.map(author => author.toLocaleLowerCase().trim());
    const uniqueAuthors = Array.from(new Set(authors));
    return uniqueAuthors.join(', ');
  }

  extractArticleFromPure(): void {
    console.log('entrando con el nombre: ', this.separatedFullName);
    this._articleService
      .getPureArticles(this.separatedFullName)
      .subscribe(response => {
        if (response.statusCode === 200) {
          this._toast.success('Articulos extraidos correctamente', {
            style: {
              border: '2px solid #4caf50',
              padding: '20px',
              fontSize: '20px',
            },
          });
        } else {
          this._toast.error('Error extrayendo' + ' inténtalo más tarde', {
            style: {
              border: '2px solid #f44336',
              padding: '20px',
              fontSize: '20px',
            },
          });
        }
      });
  }

  deleteArticle(article: ArticleItem): void {
    this._articleService.deleteArticle(article.id || '').subscribe(response => {
      if (response.statusCode === 200) {
        this._toast.success('Artículo eliminado correctamente', {
          style: {
            border: '2px solid #4caf50',
            padding: '20px',
            fontSize: '20px',
          },
        });
      } else {
        this._toast.error(response.message, {
          style: {
            border: '2px solid #f44336',
            padding: '20px',
            fontSize: '20px',
          },
        });
      }
    });
  }
  editArticle(article: ArticleItem) {
    this._modalSvc.openModal<EditArticleModalComponent, ArticleItem>(
      EditArticleModalComponent,
      article
    );
  }
}
