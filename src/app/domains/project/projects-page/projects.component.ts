import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  extractprojectsFromPure() {
    throw new Error('Method not implemented.');
  }
  createProject() {
    throw new Error('Method not implemented.');
  }
  private _toast = inject(HotToastService);
  loading$ = false;

  createproject() {
    throw new Error('Method not implemented.');
  }
  extractProjectFromPure() {
    throw new Error('Method not implemented.');
  }
}
