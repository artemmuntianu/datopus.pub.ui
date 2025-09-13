import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

    form: FormGroup;
    layout: 'emailAddress' | 'emailSent' = 'emailAddress';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    async onFormSubmit() {
        if (!this.form.valid)
            return;

        const { data, error } = await this.authService.resetPassword(
            this.form.get('email')!.value
        );
        if (error) {
            this.toastr.error(error.message);
            return;
        }

        this.layout = 'emailSent'; 
    }

}