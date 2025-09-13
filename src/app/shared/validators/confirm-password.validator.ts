import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
    controlName: string,
    matchingControlName: string,
    shouldMatch: boolean = true
): ValidatorFn {
    return (group: AbstractControl) => {
        const passwordControl = group.get(controlName);
        const matchingPasswordControl = group.get(matchingControlName);

        if (
            passwordControl?.errors &&
            !matchingPasswordControl?.errors?.['passwordMatch']
        ) {
            return null;
        }

        if (
            shouldMatch ===
                (passwordControl?.value !== matchingPasswordControl?.value) &&
            matchingPasswordControl?.value !== ''
        ) {
            
            matchingPasswordControl?.setErrors({ passwordMatch: true });
            return null;
        }

        return null;
    };
}
