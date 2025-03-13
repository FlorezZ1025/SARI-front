import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  formBuilder = inject(FormBuilder);
  
  loginForm: FormGroup = this.formBuilder.group({
    email: ['',{
      validators: [
        Validators.required,
        Validators.email]
    }],
    password: ['',{
      validators: [
        Validators.required,
        Validators.minLength(6)
      ]
    }]
  })
}
