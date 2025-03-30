import { Component, computed, Input, input, signal } from '@angular/core';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  RouterLink,
  Router,
  RouterModule,
  RouterLinkActive,
} from '@angular/router';
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
  constructor(private router: Router) {}

  isActive(route: string) {
    return this.router.url === route;
  }

  // @input() collapsed// Signal to manage the collapsed state of the sidebar
  sideNavCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  menuItems = signal<MenuItem[]>([
    { icon: 'dashboard', label: 'Home', route: '/home' },
    { icon: 'menu_book', label: 'Articles', route: '/articles' },
    { icon: 'science', label: 'Proyects', route: '/proyects' },
    { icon: 'book', label: 'Thesis', route: '/thesis' },
    { icon: 'logout', label: 'Salir', route: '/contact' },
  ]);

  profilePicSize = computed(() => (this.sideNavCollapsed() ? '32' : '100'));
}
