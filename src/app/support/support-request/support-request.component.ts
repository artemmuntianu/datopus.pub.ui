import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FileUploadControl, FileUploadModule, FileUploadValidators } from '@iplab/ngx-file-upload';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../services/api/models';
import { SupportApiService } from '../api/support.api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { UserMessages } from '../../consts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreadcrumbService } from '../../common/breadcrumbs/breadcrumb.service';

@Component({
    selector: 'app-support-request',
    templateUrl: './support-request.component.html',
    styleUrls: ['./support-request.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        FileUploadModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatProgressSpinnerModule
    ],
    providers: [SupportApiService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportRequestComponent {
    private supportApiService = inject(SupportApiService);
    private toastrService = inject(ToastrService);
    private breadCrumbService = inject(BreadcrumbService);

    userEmail = User.current!.email;
    form: FormGroup;
    submitted = signal(false);
    loading = signal(false);
  
    readonly filesLimit = 5;
    readonly fileSizeLimitBytes = 5000000; // 5MB;
    readonly profilePhotoControl = new FileUploadControl(
        {
            accept: ['image/*'],
            discardInvalid: true,
            multiple: true
        },
        [
            FileUploadValidators.accept(['image/*']),
            FileUploadValidators.filesLimit(this.filesLimit),
            FileUploadValidators.fileSize(this.fileSizeLimitBytes)
        ]
    );

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            subject: ['', Validators.required],
            message: ['', [Validators.required]],
            allowAccess: [true]
        });
    }

    ngOnInit() {
        this.breadCrumbService.setHeaderBreadcrumb(['Support Request']);
    }
    
    ngOnDestroy() {
        this.breadCrumbService.resetHeaderBreadcrumb();
    }

    get subject() {
        return this.form.get('subject')!;
    }

    get message() {
        return this.form.get('message')!;
    }

    get allowAccess() {
        return this.form.get('allowAccess')!;
    }

    async onSubmit() {
        this.submitted.set(false);
        if (this.form.valid) {
            try {
                this.loading.set(true);
                await this.supportApiService.sendSupportRequest(
                    this.message.value,
                    this.subject.value,
                    this.allowAccess.value,
                    this.profilePhotoControl.value ?? []
                );
                this.submitted.set(true);
            } catch (err) {
                let errorMessage = UserMessages.technicalIssue;

                if (err instanceof HttpErrorResponse) {
                    if (err.status === 400 && err.error?.errors) {
                        const errors = err.error.errors;
                        const allMessages = Object.values(errors)
                            .flat()
                            .join('<br>');
                        this.toastrService.error(allMessages, 'Validation Error', { enableHtml: true });
                        return;
                    } else if (err.status === 413) {
                        errorMessage = UserMessages.invalidFileSize;
                    } else if (err.status === 401 || err.status === 403) {
                        errorMessage = UserMessages.unauthorizedIssue;
                    }
                }

                this.toastrService.error(errorMessage);
            } finally {
                this.loading.set(false);
            }
        } else {
            this.form.markAllAsTouched();
        }
    }
}
