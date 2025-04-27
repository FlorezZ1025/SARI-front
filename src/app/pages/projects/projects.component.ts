import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {

  private _toast = inject(HotToastService);
  loading$: Boolean = false;
  

  
createproject() {
throw new Error('Method not implemented.');
}
extractProjectFromPure() {
throw new Error('Method not implemented.');
}

}
