import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  formBuilder = inject(FormBuilder);
  
  registerForm: FormGroup = this.formBuilder.group({
    email: ['',{
      validators: [
        Validators.required,
        Validators.email]
    }],
    name:['',{
      validators: [
        Validators.required
      ]
    }],
    lastName:['',{
      validators:
      [
        Validators.required,

      ]
    }],
    password: ['',{
      validators: [
        Validators.required,
        Validators.minLength(6)]
    }],
    confirmPassword: ['',{
      validators: [
        Validators.required,
        Validators.minLength(6)]
    }],
    userRole:['',{
      validators: [
        Validators.required
      ]
    }]
  })
  constructor() {
    this.registerForm.get('userRole')?.valueChanges.subscribe(valor => {
      console.log('Opción seleccionada:', valor);
    });
  }
  // onSubmit(){
  //   console.log(this.registerForm.value)
  // }




}
