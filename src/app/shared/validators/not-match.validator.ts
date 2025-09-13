import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notMatchValidator(values: string[] | undefined): ValidatorFn {
    return (control: AbstractControl) => {
        if (!control.value || typeof control.value !== 'string') {
            return null;
        }

        if (values?.includes(control.value)) {
            return { notMatch: true } as ValidationErrors;
        }

        return null;
    };
}
