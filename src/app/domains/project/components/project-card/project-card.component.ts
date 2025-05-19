import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProjectItem } from '@core/interfaces/project-item.interface';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
})
export class ProjectCardComponent {
  project = input.required<ProjectItem>();
  deleteProject(_t1: ProjectItem) {
    throw new Error('Method not implemented.');
  }
  editProject(_t1: ProjectItem) {
    throw new Error('Method not implemented.');
  }
}
