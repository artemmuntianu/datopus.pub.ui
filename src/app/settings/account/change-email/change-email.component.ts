import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../services/api/user.service';
import { map, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
    ConfirmationEmailDialogComponent,
    ConfirmationEmailDialogData,
} from './confirmation-email-dialog/confirmation-email-dialog.component';
import { notMatchValidator } from '../../../shared/validators/not-match.validator';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-change-email',
    standalone: true,
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    templateUrl: './change-email.component.html',
    styleUrl: './change-email.component.scss',
})
export class ChangeEmailComponent {
    private readonly userService = inject(UserService);
    private readonly dialog = inject(MatDialog);
    private readonly toastr = inject(ToastrService);
    private readonly destroy$ = new Subject<void>();

    userEmail?: string;

    emailControl = new FormControl<string>('');

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit() {
        this.userService
            .getUser()
            .pipe(
                takeUntil(this.destroy$),
                map((u) => u?.email)
            )
            .subscribe((email) => {
                this.userEmail = email;
                this.setEmailValidators();
            });
    }

    setEmailValidators() {
        if (this.userEmail) {
            this.emailControl.setValidators([
                notMatchValidator([this.userEmail]),
                Validators.email,
                Validators.required,
            ]);
            this.emailControl.updateValueAndValidity();
        }
    }

    async changeEmail() {
        if (!this.emailControl.valid) return;

        const { error } = await this.userService.updateEmail(
            this.emailControl.value!
        );

        if (error) {
            this.toastr.error(error.message);
        } else {
            await this.dialog.open<
                ConfirmationEmailDialogComponent,
                ConfirmationEmailDialogData
            >(ConfirmationEmailDialogComponent, {
                data: {
                    newEmail: this.emailControl.value!,
                    oldEmail: this.userEmail ?? '',
                },
            });
        }
    }
}
