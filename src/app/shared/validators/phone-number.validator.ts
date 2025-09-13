import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function phoneNumberValidator(required: boolean = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const phoneNumber = control.value;

        if (!phoneNumber) {
            return required ? { required } : null;
        }

        try {
            if (isValidPhoneNumber(phoneNumber)) {
                return null;
            } else {
                return { invalidPhone: true };
            }
        } catch (error) {
            return { invalidPhone: true };
        }
    };
}
