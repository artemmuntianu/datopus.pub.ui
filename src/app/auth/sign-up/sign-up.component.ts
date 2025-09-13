import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule],
    templateUrl: './sign-up.component.html',
    styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

    hidePassword = true;
    layout: 'signup' | 'signin' = 'signup';
    authForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService
    ) {
        this.authForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            organization: ['', Validators.required]
        });
    }

    async onSignup() {
        if (!this.authForm.valid)
            return;

        const { data, error } = await this.authService.signUp(
            this.authForm.get('name')!.value,
            this.authForm.get('email')!.value,
            this.authForm.get('password')!.value,
            this.authForm.get('organization')!.value,
            'b2c'
        );
        if (error) {
            this.toastr.error(error.message);
            return;
        }

        this.layout = 'signin';
    }

    async onSignin() {
        const { data, error } = await this.authService.signIn(
            this.authForm.get('email')!.value,
            this.authForm.get('password')!.value
        );
        if (error) {
            this.toastr.error(error.message);
            return;
        }

        window.location.pathname = '/';
    }

}