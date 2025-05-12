import {
  ChangeDetectorRef,
  Component,
  inject,
  AfterViewInit,
} from '@angular/core';
import { MatDialogContent } from '@angular/material/dialog';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ArticleService } from '@articles/services/article.service';
import { ArticleItem } from '@core/interfaces/article-item.interface';
import { formatDate } from '@angular/common';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@auth/services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';
import { tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '@core/services/loader.service';
import { MatIconModule } from '@angular/material/icon';

const MATERIAL_MODULES = [
  MatLabel,
  MatFormField,
  MatInputModule,
  MatDialogContent,
  MatDatepickerModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatIconModule,
  //Este no es pero los estilos se demoran en cargar
  ReactiveFormsModule,
];

@Component({
  selector: 'app-create-article-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './article-modal.component.html',
  styleUrl: './article-modal.component.css',
})
export class CreateArticleModalComponent implements AfterViewInit {
  private readonly _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private _authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private _articleService = inject(ArticleService);
  private _loaderService = inject(LoaderService);
  newArticleFormBuilder = inject(FormBuilder);
  loading$ = false;
  fileSelected = false;
  fileData: FormData = new FormData();
  constructor() {
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  articleForm: FormGroup = this.newArticleFormBuilder.group({
    title: [
      '',
      {
        validators: [
          Validators.required,
          Validators.maxLength(350),
          Validators.minLength(5),
        ],
      },
    ],
    authors: [
      '',
      {
        validators: [
          Validators.maxLength(100),
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s\\,]+$'),
          Validators.minLength(5),
        ],
      },
    ],
    date: [
      '',
      {
        validators: [Validators.required],
      },
    ],
    state: [
      '',
      {
        validators: [Validators.required],
      },
    ],
  });

  onSubmit(): void {
    const authors = this.articleForm.value.authors
      .split(',')
      .map((author: string) => author.toLocaleLowerCase().trim())
      .filter((author: string) => author !== '');
    const fullName = this._authService.fullName;
    authors.push(fullName);
    const article: ArticleItem = {
      title: this.articleForm.value.title,
      authors: authors,
      date: this.articleForm.value.date,
      state: this.articleForm.value.state,
    };
    article.date = formatDate(article.date, 'yyyy-MM-dd', 'en-US');
    const formDataToSend = new FormData();
    formDataToSend.append('title', article.title);
    formDataToSend.append('authors', JSON.stringify(article.authors)); // Si authors es un array u objeto
    formDataToSend.append('date', article.date);
    if (article.state) {
      formDataToSend.append('state', article.state);
    }
    const file = this.fileData.get('pdf');
    formDataToSend.append('pdf', file as Blob);
    this._articleService
      .createArticle(formDataToSend)
      .pipe(
        tap(() => {
          console.log(formDataToSend);
        }),
        tap(response => {
          if (response.statusCode === 200) {
            this._toast.success('Artículo creado correctamente', {
              style: {
                border: '2px solid #4caf50',
                padding: '20px',
                fontSize: '20px',
              },
            });
          } else {
            this._toast.error(response.message, {
              style: {
                border: '2px solid #f44336',
                padding: '20px',
                fontSize: '20px',
              },
            });
          }
        })
      )
      .subscribe();
    this.articleForm.reset();
    this._modalSvc.closeModal();
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
