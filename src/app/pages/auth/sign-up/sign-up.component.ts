import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.interface';
import { tap } from 'rxjs';
import { CustomValidators } from '../../../../shared/custom-validations';

@Component({
  selector: 'sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  formBuilder = inject(FormBuilder);
  _authService = inject(AuthService);

  user: User = {};

  UserRoleOptions = [
    { value: 'researcher', label: 'Investigador' },
    { value: 'coordinator', label: 'Coordinador' },
    { value: 'administrator', label: 'Administrador' },
  ];

  registerForm: FormGroup = this.formBuilder.group({
    email: [
      '',
      {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(30),
        ],
      },
    ],
    name: [
      '',
      {
        validators: [
          Validators.required,
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s]+$'),
          Validators.maxLength(30),
        ],
      },
    ],
    lastName: [
      '',
      {
        validators: [
          Validators.required,
          Validators.pattern('^[A-Za-zÁÉÍÓÚÜáéíóúüñÑ\\s]+$'),
          Validators.maxLength(30),
        ],
      },
    ],
    password: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
        ],
      },
    ],
    confirmPassword: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          CustomValidators.mustBeEqual('confirmPassword', 'password'),
        ],
      },
    ],
    role: [
      '',
      {
        validators: [Validators.required],
      },
    ],
  });

  constructor(private _router: Router) {
    // this._authService.token.subscribe((token) => {
    //   if (token) {
    //     this._router.navigate(['/']);
    //   }
    // });

    this.registerForm.valueChanges.subscribe((value) => {
      Object.assign(this.user, value);
    });
  }
  register() {
    console.log(this.user);
    this._authService
      .doRegister(this.user as User)
      .pipe(
        tap((response) => {
          alert(`${response.message} --- ${response.statusCode}`);
          if (response.statusCode === 201) {
            this._router.navigate(['/']);
          }
        })
      )
      .subscribe();
  }
}
