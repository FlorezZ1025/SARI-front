import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArticleItem } from '@core/interfaces/article-item.interface';
import { EditArticleModalComponent } from '../edit-article-modal/edit-article-modal.component';
import { ModalService } from '@core/services/modal.service';
import { ArticleService } from '@articles/services/article.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  article = input.required<ArticleItem>();
  private _modalSvc = inject(ModalService);
  private _articleService = inject(ArticleService);
  private _toast = inject(HotToastService);

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
