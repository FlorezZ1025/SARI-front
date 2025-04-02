import { Component, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { IndicatorService } from '../../services/indicator.service';
import { ArticleItem } from '../../interfaces/article-item.interface';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent {

  user:Signal<User | null | undefined>;
  fullName: string;
  separatedFullName: string;
  articles: ArticleItem[]=[];

  constructor(private _client:HttpClient, public authService:AuthService, private _indicatorService:IndicatorService) {
    this.user = this.authService.currentUser;
    this.articles = this._indicatorService.getArticlesFromLocalStorage();

    this.fullName  = `${this.user()?.name} ${this.user()?.lastName}`|| '';
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');  
  
  }

  formatAuthors(authors: string[]): string {
    authors = authors.map((author) => author.toLocaleLowerCase().trim());
    const uniqueAuthors = Array.from(new Set(authors));
    return uniqueAuthors.join(', ');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  extractFromPure():void{
    console.log('entrando con el nombre: ', this.separatedFullName);
    this._indicatorService.getPureArticles(this.separatedFullName).subscribe((response: any) => {
      // console.log(response);
      // alert('Se ha extraido el texto del articulo con exito');
    })
    // console.log(this.separatedFullName);
  }


}
