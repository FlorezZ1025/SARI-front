import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { LoginRequest } from '../../interfaces/login-request.interface';

@Component({
  selector: 'sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  formBuilder = inject(FormBuilder);
  _authService = inject(AuthService);
  
  loginRequest:LoginRequest = {}

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
        validators: [Validators.required, Validators.minLength(6)],
      },
    ],
  });

  constructor(private _router: Router) {
    this._authService.token.subscribe((token) => {
      if (token) {
        this._router.navigate(['/sign-up']);
      }
    });

    this.loginForm.valueChanges.subscribe((value) => {
      Object.assign(this.loginRequest, value);
    });
  }

  login() {
    this._authService.doLogin(this.loginRequest).subscribe((response) => {});
  }
}
