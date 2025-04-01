import { Component, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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

  constructor(private _client:HttpClient, public authService:AuthService) {
    this.user = this.authService.currentUser;
    this.fullName  = `${this.user()?.name} ${this.user()?.lastName}`|| '';
    this.separatedFullName = this.fullName.toLowerCase().split(' ').join('-');
  
  }

  extractFromPure():void{
    console.log(this.separatedFullName);
    console.log(this.fullName);
  }


}
