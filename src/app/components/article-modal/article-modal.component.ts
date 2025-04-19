import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  selector: 'app-article-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './article-modal.component.html',
  styleUrl: './article-modal.component.css',
})
export class ModalComponent {
  private readonly _modalSvc = inject(ModalService);
  constructor(
    private cdr: ChangeDetectorRef,
    private _articleService: ArticleService
  ) {}

  ngAfterViewInit() {
    // console.log('ModalComponent ngAfterViewInit');
    this.cdr.detectChanges();
  }

  _authService = inject(AuthService);

  newArticleFormBuilder = inject(FormBuilder);
  articleForm: FormGroup = this.newArticleFormBuilder.group({
    tittle: [
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
    console.log(this.articleForm.value);

    let fullName =
      this._authService.currentUser()?.name +
      ' ' +
      this._authService.currentUser()?.lastName;
    const authors = this.articleForm.value.authors
      .split(',')
      .map((author: string) => author.toLocaleLowerCase().trim())
      .filter((author: string) => author !== '');
    console.log(authors);
    console.log(authors.unshift(fullName));
    console.log(typeof authors);
    // const uniqueAuthors = Array.from(new Set(authors));
    const article: ArticleItem = {
      title: this.articleForm.value.tittle,
      authors: authors,
      date: this.articleForm.value.date,
      state: this.articleForm.value.state,
      id: Date.now() + Math.random(),
    };
    console.log(article);
    article.date = formatDate(article.date, 'yyyy-MM-dd', 'en-US');
    this._articleService.createArticle(article);
    this.articleForm.reset();

    this._modalSvc.closeModal();
  }
}
