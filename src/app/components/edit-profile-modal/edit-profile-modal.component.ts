import { ChangeDetectorRef, Component, inject, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

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
  styleUrl: './edit-profile-modal.component.css'
})
export class EditProfileModalComponent {

  private readonly _modalSvc = inject(ModalService);
  private readonly _authService = inject(AuthService);

  user:User|null|undefined = this._authService.currentUser();
  constructor(
    private cdr: ChangeDetectorRef,
  ){
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
      }
    ],
    lastName: 
    [this.user?.lastName,
      {
        validators: [
          Validators.required,
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s]+$'),
          Validators.maxLength(30),
        ],
      }
    ],
    email: [
      this.user?.email,
      {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(30),
        ],
      }
    ],
    // password: [''],
  });

  onSubmit() {

    this._modalSvc.closeModal();
    }
}
