import { Component, input } from '@angular/core';
import { ArticleItem } from '@core/interfaces/article-item.interface';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [ArticleCardComponent, MatProgressSpinnerModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css',
})
export class ArticleListComponent {
  articles = input.required<ArticleItem[]>();
}
