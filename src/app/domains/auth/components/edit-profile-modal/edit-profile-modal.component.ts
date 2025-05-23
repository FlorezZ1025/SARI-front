import {
  ChangeDetectorRef,
  Component,
  inject,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@auth/services/auth.service';
import { User } from '@core/interfaces/user.interface';
import { tap } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthResponse } from '@core/interfaces/auth-response.interface';

const MATERIAL_MODULES = [
  MatLabel,
  MatFormField,
  MatInputModule,
  MatDialogContent,
  MatSelectModule,
  //Este no es pero los estilos se demoran en cargar
  ReactiveFormsModule,
];

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './edit-profile-modal.component.html',
  styleUrl: './edit-profile-modal.component.css',
})
export class EditProfileModalComponent implements AfterViewInit {
  private readonly _modalSvc = inject(ModalService);
  private readonly _authService = inject(AuthService);
  private _toast = inject(HotToastService);
  private cdr = inject(ChangeDetectorRef);

  user = this._authService.currentUser();
  editInfo = {};
  constructor() {
    this.userInfoForm.valueChanges.subscribe(value => {
      console.log(this.userInfoForm);
      Object.assign(this.editInfo, value);
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  newUserInfoFormBuilder = inject(FormBuilder);
  userInfoForm = this.newUserInfoFormBuilder.group({
    name: [
      this.user?.name,
      {
        validators: [
          Validators.required,
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s]+$'),
          Validators.maxLength(30),
        ],
      },
    ],
    lastName: [
      this.user?.lastName,
      {
        validators: [
          Validators.required,
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s]+$'),
          Validators.maxLength(30),
        ],
      },
    ],
    email: [
      this.user?.email,
      {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(30),
        ],
      },
    ],
  });

  onSubmit() {
    const user: User = {
      id: this.user?.id,
      name: this.userInfoForm.value.name?.toLocaleLowerCase() || '',
      lastName: this.userInfoForm.value.lastName?.toLocaleLowerCase() || '',
      email: this.userInfoForm.value.email?.toLowerCase() || '',
    };
    this._authService
      .updateUserInfo(user)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.statusCode === 200) {
            this._toast.success('Información actualizada correctamente', {
              style: {
                padding: '20px',
                fontSize: '20px',
                border: '2px solid #4caf50',
              },
            });
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

    this._modalSvc.closeModal();
  }
}
