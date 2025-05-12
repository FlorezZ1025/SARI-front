import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth/services/auth.service';
import { environment } from '@config/environments/environment';
import { ProjectItem } from '@core/interfaces/project-item.interface';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  url = environment.API_URL;
  private _client = inject(HttpClient);
  private _authService = inject(AuthService);
  private _userId: string | undefined;

  private projectSubject = new BehaviorSubject<ProjectItem[]>([]);
  public projects$: Observable<ProjectItem[]> =
    this.projectSubject.asObservable();
  public currentProjects = toSignal(this.projects$);

  constructor() {
    this._authService.currentUser$.subscribe(() => {
      console.log('User changed:', this._authService.currentUser()?.name);
      if (AuthService.token === '') {
        this.setEmptyProjects();
        return;
      }
      this._userId = this._authService.currentUser()?.id;
    });
  }
  getCurrentProjects(): ProjectItem[] {
    return this.projectSubject.value;
  }

  setEmptyProjects(): void {
    this.projectSubject.next([]);
  }
  private createProjectInLocalStorage(project: ProjectItem): void {
    const projects = this.getProjectsFromLocalStorage();
    projects.push(project);
    localStorage.setItem(`projects ${this._userId}`, JSON.stringify(projects));
  }
  private getProjectsFromLocalStorage(): ProjectItem[] {
    const projects = localStorage.getItem(`projects ${this._userId}`);
    return projects ? JSON.parse(projects) : [];
  }

  public getPureProjects(): Observable<ProjectItem[]> {
    const url = `${this.url}/projects/pure_projects`;
    const fullName = this._authService.fullSepName;
    const data = { fullname: fullName };
    return this._client.post<ProjectItem[]>(url, data).pipe(
      tap((response: ProjectItem[]) => {
        this.updateLocalStorage(response);
      }),
      catchError(error => {
        console.error('Error fetching projects:', error);
        return [];
      })
    );
  }

  private updateLocalStorage(pureProjects: ProjectItem[]) {
    const currentProjects = this.getProjectsFromLocalStorage();
    console.log('Current projects:', currentProjects);
    if (currentProjects.length === 0) {
      this.setProjectsInLocalStorage(pureProjects);
      return;
    }

    const existingIds = currentProjects.map(art => art.id);
    const newProjects = pureProjects.filter(
      article => !existingIds.includes(article.id)
    );

    if (newProjects.length > 0) {
      this.setProjectsInLocalStorage([...currentProjects, ...newProjects]);
    }
  }

  private setProjectsInLocalStorage(projects: ProjectItem[]) {
    localStorage.setItem(`projects ${this._userId}`, JSON.stringify(projects));
    this.projectSubject.next(projects);
  }
  public loadProjectsOnStart(): Observable<ProjectItem[]> {
    const actualProjects = this.getProjectsFromLocalStorage();
    if (actualProjects.length > 0) {
      this.projectSubject.next(actualProjects);
      return of(actualProjects);
    } else {
      return this.getProjectsFromDB();
    }
  }
  private getProjectsFromDB(): Observable<ProjectItem[]> {
    const url = `${this.url}/projects/get_all`;
    return this._client.get<ProjectItem[]>(url).pipe(
      tap((response: ProjectItem[]) => {
        this.setProjectsInLocalStorage(response);
        return response;
      }),
      catchError(error => {
        console.error('Error fetching projects:', error);
        return of([]);
      })
    );
  }
}
