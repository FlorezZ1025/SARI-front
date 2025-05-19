import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@auth/services/auth.service';
import { LoaderService } from '@core/services/loader.service';
import { ModalService } from '@core/services/modal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { ProjectService } from '@project/services/project.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [
    MatLabel,
    MatFormField,
    MatInputModule,
    MatDialogContent,
    MatDatepickerModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.css',
})
export class CreateProjectModalComponent implements AfterViewInit {
  private _authService = inject(AuthService);
  private _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private cdr = inject(ChangeDetectorRef);

  private _projectService = inject(ProjectService);
  private _loaderService = inject(LoaderService);
  fileData: FormData = new FormData();
  loading$ = false;
  fileSelected = false;
  newProjectFormBuilder = inject(FormBuilder);

  constructor() {
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }
  projectForm = this.newProjectFormBuilder.group({
    title: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(350),
        ],
      },
    ],
    investigators: [
      '',
      {
        validators: [
          Validators.minLength(3),
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s\\,]+$'),
          Validators.maxLength(350),
        ],
      },
    ],
    date: [
      '',
      {
        validators: [Validators.required],
      },
    ],
    status: [
      '',
      {
        validators: [Validators.required],
      },
    ],
    formulatedType: [
      '',
      {
        validators: [Validators.required],
      },
    ],
  });

  onSubmit() {
    const formData = this.getFormData();
    this._projectService
      .createProject(formData)
      .pipe(
        tap(response => {
          if (response.statusCode === 201) {
            this._toast.success('Proyecto creado con éxito', {
              style: {
                border: '2px solid #4CAF50',
              },
            });
            this._modalSvc.closeModal();
          } else {
            this._toast.error(response.message, {
              style: {
                border: '2px solid #F44336',
              },
            });
          }
        })
      )
      .subscribe();
  }

  getFormData() {
    const investigatorsValue = this.projectForm.value.investigators;
    let investigators: string[] = [];
    if (investigatorsValue) {
      investigators = investigatorsValue
        .split(',')
        .map((author: string) => author.toLocaleLowerCase().trim())
        .filter((author: string) => author !== '');
    }
    investigators.push(this._authService.fullName);
    const formData = new FormData();
    formData.append('title', this.projectForm.value.title as string);
    formData.append('investigators', JSON.stringify(investigators));
    formData.append(
      'date',
      formatDate(this.projectForm.value.date as string, 'yyyy-MM-dd', 'en-US')
    );
    formData.append('status', this.projectForm.value.status as string);
    formData.append(
      'formulatedType',
      this.projectForm.value.formulatedType as string
    );
    const file = this.fileData.get('pdf');
    formData.append('pdf', file as Blob);
    return formData;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.fileSelected = true;
      const file = input.files[0]; // si necesitas el archivo
      this.fileData.set('pdf', file);
    } else {
      this.fileSelected = false;
    }
  }
}
