import { Component, computed, Input, input, Signal, signal } from '@angular/core';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  RouterLink,
  Router,
  RouterModule,
  RouterLinkActive,
} from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterModule,
    RouterLinkActive,
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent {
  
  user:Signal<User | null | undefined>;
  
  constructor(private router: Router, public authService: AuthService) {
     this.user = this.authService.currentUser;
  }
  
  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
  
  menuItems = signal<MenuItem[]>([
    { icon: 'dashboard', label: 'Inicio', route: '/home' },
    { icon: 'menu_book', label: 'Articulos', route: '/articles' },
    { icon: 'science', label: 'Proyectos', route: '/projects' },
    { icon: 'book', label: 'Tesis', route: '/thesis' },
  ]);
  
  profilePicSize = computed(() => (this.sideNavCollapsed() ? '32' : '100'));
  
  logout() {
    this.authService.removeSession();  
    this.router.navigate(['/sign-in']);
  }
}
