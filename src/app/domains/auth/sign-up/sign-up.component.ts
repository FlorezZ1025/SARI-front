import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { User } from '@core/interfaces/user.interface';
import { tap } from 'rxjs';
import { CustomValidators } from '@config/custom-validations';
import { HotToastService } from '@ngneat/hot-toast';
import { LoaderService } from '@core/services/loader.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _toast = inject(HotToastService);
  private _loaderService = inject(LoaderService);
  loading$ = false;
  user = {};

  constructor(private _router: Router) {
    this._loaderService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
    this.registerForm.valueChanges.subscribe(value => {
      Object.assign(this.user, value);
    });
  }

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

  register() {
    console.log(this.user);
    this._authService
      .doRegister(this.user as User)
      .pipe(
        tap(response => {
          if (response.statusCode === 201) {
            this._toast.success('Usuario registrado correctamente', {
              style: {
                border: '2px solid #4CAF50',
              },
            });
            this._router.navigate(['/']);
          } else {
            this._toast.error(response.message, {
              style: {
                border: '2px solid #f44336',
              },
            });
          }
        })
      )
      .subscribe();
  }
}
