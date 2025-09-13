import { Component, inject } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../services/api/user.service';
import { UserMessages } from '../../../consts';
import { passwordMatchValidator } from '../../../shared/validators/confirm-password.validator';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
    ],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
    private readonly fb = inject(FormBuilder);
    private readonly userService = inject(UserService);
    private readonly toastr = inject(ToastrService);

    readonly passwordsForm: FormGroup<{
        newPassword: FormControl<string | null>;
        confirmPassword: FormControl<string | null>;
    }>;

    // Password Hide
    hide = true;
    hide2 = true;

    constructor() {
        this.passwordsForm = this.fb.group(
            {
                newPassword: [
                    '',
                    [Validators.required, Validators.minLength(6)],
                ],
                confirmPassword: ['', [Validators.required]],
            },
            {
                validators: [
                    passwordMatchValidator('newPassword', 'confirmPassword'),
                ],
            }
        );
    }

    async updatePassword() {
        if (this.passwordsForm.invalid) return;

        const data = this.passwordsForm.value;

        const response = await this.userService.updatePassword(
            data.newPassword!
        );

        if (response.error) {
            this.toastr.error(response.error.message);
        } else {
            this.toastr.success(UserMessages.passwordUpdateSuccess);
        }
        this.resetForm();
    }

    private resetForm() {
        this.passwordsForm.reset();
        this.passwordsForm.controls.confirmPassword.setErrors(null);
        this.passwordsForm.controls.newPassword.setErrors(null);
    }
}
