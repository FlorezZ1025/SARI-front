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
import { LoginRequest } from '../../../interfaces/login-request.interface';

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
        validators: [Validators.required],
      },
    ],
  });

  constructor(private _router: Router) {
    if(AuthService.token){
      this._router.navigate(['/home']);
    };

    this.loginForm.valueChanges.subscribe((value) => {
      Object.assign(this.loginRequest, value);
    });
  }

  login() {
    this._authService.doLogin(this.loginRequest).subscribe((response) => {
      console.log(response)
      alert(response.message);
      if (response.statusCode === 200) {
        this._router.navigate(['/home']);
      }
    });
  }
}
