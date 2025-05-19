import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProjectItem } from '@core/interfaces/project-item.interface';
import { HotToastService } from '@ngneat/hot-toast';
import { ProjectService } from '@project/services/project.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
})
export class ProjectCardComponent {
  private _projectService = inject(ProjectService);
  private _toast = inject(HotToastService);
  project = input.required<ProjectItem>();

  deleteProject(id: string) {
    console.log(this.project);
    this._projectService
      .deleteProject(id)
      .pipe(
        tap(response => {
          if (response.statusCode === 200) {
            this._toast.success(response.message, {
              style: {
                border: '2px solid #4caf50',
              },
            });
          } else {
            this._toast.error('Error eliminando el proyecto', {
              style: {
                border: '2px solid #f44336',
              },
            });
          }
        })
      )
      .subscribe();
  }
  // editProject(_t1: ProjectItem) {
  //   throw new Error('Method not implemented.');
  // }
}
