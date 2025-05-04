import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export class CustomValidators extends Validators {
  static mustBeEqual(
    controlName: string,
    matchingControlName: string
  ): ValidatorFn {
    return (_control: AbstractControl): ValidationErrors | null => {
      const control = _control.value;
      const matchingControl = _control.parent?.get(matchingControlName)?.value;
      return control === matchingControl ? null : { mustBeEqual: true };
    };
  }

  static onlyNumbers(control: AbstractControl): ValidationErrors | null {
    return /^\d+$/.test(control.value) ? null : { onlyNumbers: true };
  }

  static atLeastOneNumber(control: AbstractControl): ValidationErrors | null {
    return /\d+/.test(control.value) ? null : { toNumber: true };
  }

  static atLeastOneUppercase(
    control: AbstractControl
  ): ValidationErrors | null {
    return /[A-Z]+/.test(control.value) ? null : { atLeastOneUppercase: true };
  }

  static atLeastOneLowercase(
    control: AbstractControl
  ): ValidationErrors | null {
    return /[a-z]+/.test(control.value) ? null : { atLeastOneLowercase: true };
  }
}
