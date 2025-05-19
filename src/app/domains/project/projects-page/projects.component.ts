import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectItem } from '@core/interfaces/project-item.interface';
import { LoaderService } from '@core/services/loader.service';
import { ModalService } from '@core/services/modal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { CreateProjectModalComponent } from '@project/components/create-project-modal/create-project-modal.component';
import { ProjectCardComponent } from '@project/components/project-card/project-card.component';
import { ProjectService } from '@project/services/project.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ProjectCardComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  private _modalSvc = inject(ModalService);
  private _projectService = inject(ProjectService);
  private _loaderService = inject(LoaderService);
  private _toast = inject(HotToastService);
  projects: ProjectItem[] = [];
  loading$ = false;

  constructor() {
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
    this._projectService.projects$.subscribe(() => {
      this.projects = this._projectService.getCurrentProjects();
    });
  }
  ngOnInit(): void {
    if (this._projectService.getCurrentProjects().length === 0) {
      this._projectService.loadProjectsOnStart().subscribe({
        error: () => {
          this._toast.error('Error cargando proyectos', {
            style: {
              border: '2px solid #f44336',
            },
          });
        },
      });
    }
  }
  createProject() {
    this._modalSvc.openModal<CreateProjectModalComponent, ProjectItem>(
      CreateProjectModalComponent
    );
  }

  createproject() {
    throw new Error('Method not implemented.');
  }
  extractProjectsFromPure() {
    this._projectService.getPureProjects().subscribe({
      next: () => {
        this._toast.success('Proyectos cargados con éxito', {
          style: {
            border: '2px solid #4caf50',
          },
        });
      },
      error: () => {
        this._toast.error('Error cargando proyectos', {
          style: {
            border: '2px solid #f44336',
          },
        });
      },
    });
  }
}
