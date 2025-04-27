import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../interfaces/login-request.interface';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _toast = inject(HotToastService);

  loginRequest: LoginRequest = {};

  loginForm: FormGroup = this.formBuilder.group({
    email: [
      '',
      {
        validators: [Validators.required, Validators.email],
      },
    ],
    password: [
      '',
      {
        validators: [Validators.required],
      },
    ],
  });

  constructor(private _router: Router) {
    if (AuthService.token) {
      this._router.navigate(['/']);
    }

    this.loginForm.valueChanges.subscribe((value) => {
      Object.assign(this.loginRequest, value);
    });
  }

  login() {
    this._authService.doLogin(this.loginRequest).subscribe((response) => {
      if (response.statusCode === 200) {
        this._toast.success('Bienvenido a SARI', {
          style:{
            border: '2px solid #4CAF50',
            padding: '20px',
            fontSize: '20px',
          }
        });
        this._router.navigate(['/articles']);
      } else {
        this._toast.error(response.message,
          {
            style:{
              border: '2px solid #F44336',
              padding: '20px',
              fontSize: '20px',
            }
          }
        );
      }
    });
  }
}
