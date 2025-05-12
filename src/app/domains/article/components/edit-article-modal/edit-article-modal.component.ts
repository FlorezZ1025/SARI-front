import {
  ChangeDetectorRef,
  Component,
  inject,
  signal,
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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  selector: 'app-edit-article-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './edit-article-modal.component.html',
  styleUrl: '../create-article-modal/article-modal.component.css',
})
export class EditArticleModalComponent implements AfterViewInit {
  private readonly _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private _articleService = inject(ArticleService);
  private _authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private _loaderService = inject(LoaderService);
  loading$ = false;
  fileSelected = false;
  newArticleFormBuilder = inject(FormBuilder);

  article: ArticleItem = inject(MAT_DIALOG_DATA).data;
  isEditing = signal(true);
  constructor() {
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
    this.editArticleForm.valueChanges.subscribe(() => {
      console.log(this.editArticleForm.valid);
    });

    this.addHyperlinkForm.valueChanges.subscribe(() => {
      console.log(this.addHyperlinkForm.valid);
    });
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  editArticleForm: FormGroup = this.newArticleFormBuilder.group({
    title: [
      this.article.title,
      {
        validators: [Validators.required, Validators.minLength(3)],
      },
    ],
    authors: [
      this.article.authors.join(','),
      {
        validators: [
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s\\,]+$'),
          Validators.minLength(5),
        ],
      },
    ],
    date: [this.article.date, { validators: [Validators.required] }],
    state: [this.article.state, { validators: [Validators.required] }],
  });

  addHyperlinkForm: FormGroup = this.newArticleFormBuilder.group({
    hyperlink: ['', { validators: [Validators.required] }],
  });

  onSubmitHyperlink() {
    const newHyperlink = this.addHyperlinkForm.value.hyperlink;
    console.log(newHyperlink);
    return this._articleService
      .addArticleHyperlink(this.article, newHyperlink)
      .pipe(tap(() => this._modalSvc.closeModal()))
      .subscribe({
        next: () => {
          this._toast.success('Hypervínculo agregado', {
            style: {
              padding: '20px',
              fontSize: '20px',
              border: '2px solid #4caf50',
            },
          });
        },
        error: () => {
          this._toast.error('Error al agregar el enlace', {
            style: {
              padding: '20px',
              fontSize: '20px',
              border: '2px solid #f44336',
            },
          });
        },
      });
  }
  onSubmitEdited() {
    console.log(this.editArticleForm.value);
    const authors = this.editArticleForm.value.authors
      .split(',')
      .map((author: string) => author.toLocaleLowerCase().trim())
      .filter((author: string) => author !== '');

    const article: ArticleItem = {
      id: this.article.id,
      title: this.editArticleForm.value.title,
      authors: authors,
      date: formatDate(this.editArticleForm.value.date, 'yyyy-MM-dd', 'en-US'),
      state: this.editArticleForm.value.state,
    };
    this._articleService
      .editArticle(article)
      .pipe(
        tap(response => {
          if (response.statusCode === 200) {
            this._toast.success(response.message, {
              style: {
                padding: '20px',
                fontSize: '20px',
                border: '2px solid #4caf50',
              },
            });
            this._modalSvc.closeModal();
          } else {
            this._toast.error(response.message, {
              style: {
                padding: '20px',
                fontSize: '20px',
                border: '2px solid #f44336',
              },
            });
          }
        })
      )
      .subscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.fileSelected = true;
      const file = input.files[0]; // si necesitas el archivo
      console.log('Archivo seleccionado:', file.name);
    } else {
      this.fileSelected = false;
    }
  }
}
