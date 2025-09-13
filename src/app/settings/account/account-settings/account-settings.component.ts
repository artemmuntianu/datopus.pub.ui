import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import {
    FileUploadControl,
    FileUploadModule,
    FileUploadValidators,
} from '@iplab/ngx-file-upload';
import { User } from '../../../services/api/models';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { phoneNumberValidator } from '../../../shared/validators/phone-number.validator';
import {
    buffer,
    filter,
    Observable,
    of,
    Subject,
    switchMap,
    takeUntil,
    withLatestFrom,
} from 'rxjs';
import { UserService } from '../../../services/api/user.service';
import {
    SocialAccountType,
    UserMetaData,
} from '../../../services/api/interfaces/user';
import { UserData, UserMessages } from '../../../consts';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserResponse } from '@supabase/supabase-js';
import { ToastrService } from 'ngx-toastr';

interface ProfileFormData
    extends Partial<{
        fullName: string | null;
        phone: string | null;
        socialProfiles: Partial<{
            x: string;
            facebook: string;
            linkedin: string;
        }>;
    }> {}

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        FileUploadModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    templateUrl: './account-settings.component.html',
    styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent {
    private readonly userService = inject(UserService);
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly toastr = inject(ToastrService);
    private userBuffer$ = new Subject<void>();

    user$: Observable<User | null> = this.userService.getUser();

    destroy$ = new Subject<void>();
    userPhotoUrl = UserData.defaultProfilePhotoUrl;

    profileForm: FormGroup<{
        fullName: FormControl<string | null>;
        phone: FormControl<string | null>;
        socialProfiles: FormGroup<Record<SocialAccountType, FormControl>>;
    }>;

    readonly userDefaultPhotoUrl = UserData.defaultProfilePhotoUrl;
    readonly filesLimit = 1;
    readonly fileSizeLimitBytes = 5000000; // 5MB;
    readonly profilePhotoControl = new FileUploadControl(
        {
            accept: ['image/*'],
            discardInvalid: true,
            multiple: false,
        },
        [
            FileUploadValidators.accept(['image/*']),
            FileUploadValidators.filesLimit(this.filesLimit),
            FileUploadValidators.fileSize(this.fileSizeLimitBytes),
        ]
    );

    constructor() {
        this.profileForm = this.fb.group({
            fullName: ['', Validators.required],
            phone: ['', [phoneNumberValidator()]],
            // NOTE: it matches any url, but we might want to make it match exact domains
            socialProfiles: this.fb.group({
                facebook: [
                    '',
                    [
                        Validators.pattern(
                            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                        ),
                    ],
                ],
                x: [
                    '',
                    [
                        Validators.pattern(
                            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                        ),
                    ],
                ],
                linkedin: [
                    '',
                    [
                        Validators.pattern(
                            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                        ),
                    ],
                ],
            }),
        });
    }

    ngOnInit() {
        this.user$
            .pipe(
                takeUntil(this.destroy$),
                buffer(this.userBuffer$),
                filter((users) => users.length > 0),
                switchMap((users) => of(users[users.length - 1]))
            )
            .subscribe((user) => {
                this.profileForm.patchValue(
                    {
                        fullName: user?.full_name,
                        phone: user?.phone,
                        socialProfiles: user?.social_profiles,
                    },
                    { emitEvent: false }
                );

                if (user?.picture) {
                    this.userPhotoUrl = user.picture;
                }
            });

        this.profilePhotoControl.valueChanges
            .pipe(takeUntil(this.destroy$), withLatestFrom(this.user$))
            .subscribe(([files, user]) => this.onPhotoChange(files, user));

        this.userBuffer$.next();
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    deleteProfileImage() {
        // TODO: Add endpoint to backend to remove image from blob storage;
        this.profilePhotoControl.clear();
        this.userPhotoUrl = this.userDefaultPhotoUrl;
    }

    onPhotoChange(files: File[], user: User | null) {
        var reader = new FileReader();

        if (files.length === 0) {
            this.userPhotoUrl = user?.picture || this.userDefaultPhotoUrl;
            return;
        }

        reader.onload = (event) => {
            this.userPhotoUrl = event.target!.result as string;
        };

        reader.onerror = () => {
            this.toastr.error(UserMessages.imageProccessingIssue);
        };

        reader.readAsDataURL(files[files.length - 1]);
    }

    navigateBack(): void {
        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/']);
        }
    }

    async saveProfile(): Promise<void> {
        if (!this.isFormValid()) return;

        const data = this.filterPayload(this.profileForm.value);
        let profilePhotoUrl = this.userPhotoUrl;

        try {
            if (this.hasNewPhoto()) {
                profilePhotoUrl = await this.handlePhotoUpload();
            }

            await this.updateUserProfile(data, profilePhotoUrl);
            this.showSuccessMessage();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.resetForm();
            this.userBuffer$.next();
        }
    }

    private resetFormToDefault() {
        this.profilePhotoControl.clear();
    }

    private isFormValid(): boolean {
        return this.profileForm.valid && this.profilePhotoControl.valid;
    }

    private hasNewPhoto(): boolean {
        return this.profilePhotoControl.value?.length > 0;
    }

    private async handlePhotoUpload(): Promise<string> {
        const photoFile = this.profilePhotoControl.value[0];
        return this.uploadProfilePhoto(photoFile);
    }

    private async updateUserProfile(
        data: Partial<UserMetaData>,
        profilePhotoUrl: string
    ): Promise<UserResponse> {
        const updatedData = this.prepareMetaData(data, profilePhotoUrl);
        return this.userService.updateMetaData(updatedData);
    }

    private prepareMetaData(
        data: Partial<UserMetaData>,
        profilePhotoUrl: string | null
    ): Partial<UserMetaData> {
        if (profilePhotoUrl === this.userDefaultPhotoUrl) {
            data.picture = '';
        } else if (profilePhotoUrl) {
            data.picture = profilePhotoUrl;
        }
        return data;
    }

    private showSuccessMessage(): void {
        this.toastr.success(UserMessages.profileUpdateSuccess);
    }

    private handleError(error: unknown): void {
        console.error('Error while updating profile:', error);
        this.toastr.success(UserMessages.profileUpdateIssue);
    }

    private resetForm(): void {
        this.resetFormToDefault();
    }

    private async uploadProfilePhoto(photo: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', photo);
        return this.userService.uploadProfileImage(formData);
    }

    private filterPayload(data: ProfileFormData): Partial<UserMetaData> {
        return Object.fromEntries(
            Object.entries({
                full_name: data.fullName,
                phone: data.phone,
                social_profiles: data.socialProfiles,
            } as UserMetaData).filter(
                ([_, value]) => value !== null && value !== undefined
            )
        );
    }
}
