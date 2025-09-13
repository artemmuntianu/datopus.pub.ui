import { NgIf } from '@angular/common';
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
    selector: 'app-sign-in',
    standalone: true,
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

    hide = true;
    authForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
    ) {
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    async onSubmit() {
        if (!this.authForm.valid)
            return;

        const { data, error } = await this.authService.signIn(this.authForm.get('email')!.value, this.authForm.get('password')!.value);
        if (error)
            this.toastr.error(error.message);
        else
            window.location.pathname = '/';
    }

}