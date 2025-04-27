import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
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
import { ArticleService } from '../../services/article.service';
import { ArticleItem } from '../../interfaces/article-item.interface';
import { formatDate } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';
import { tap } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

const MATERIAL_MODULES = [
  MatLabel,
  MatFormField,
  MatInputModule,
  MatDialogContent,
  MatDatepickerModule,
  MatSelectModule,
  //Este no es pero los estilos se demoran en cargar
  ReactiveFormsModule,
];

@Component({
  selector: 'app-edit-article-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './edit-article-modal.component.html',
  styleUrl: './edit-article-modal.component.css',
})
export class EditArticleModalComponent {
  private readonly _modalSvc = inject(ModalService);
  private _toast = inject(HotToastService);
  private _articleService = inject(ArticleService);
  private _authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  newArticleFormBuilder = inject(FormBuilder);

  article: ArticleItem = inject(MAT_DIALOG_DATA).data;
  isEditing = signal(true);
  constructor() {
    this.editArticleForm.valueChanges.subscribe((value) => {
      console.log(this.editArticleForm.valid);
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

  onSubmit() {
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
    console.log('Article to edit:', article);
    this._articleService
      .editArticle(article)
      .pipe(
        tap((response) => {
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
}
