import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

    hidePassword1 = true;
    hidePassword2 = true;
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group(
            {
                password1: ['', [Validators.required, Validators.minLength(6)]],
                password2: ['', [Validators.required, Validators.minLength(6)]]
            },
            {
                validator: ResetPasswordComponent.passwordsMatchValidator
            }
        );
    }

    static passwordsMatchValidator(form: AbstractControl) {
        if (!form.get('password1') || !form.get('password2'))
            return null;

        return form.get('password1')!.value === form.get('password2')!.value
            ? null
            : { equals: true };
    }

    async onFormSubmit() {
        if (!this.form.valid)
            return;

        const { data, error } = await this.authService.setPassword(
            this.form.get('password1')!.value
        );
        if (error) {
            this.toastr.error(error.message);
            return;
        }

        window.location.pathname = '/';
    }

}