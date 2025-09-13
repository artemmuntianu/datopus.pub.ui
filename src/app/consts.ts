export const UserMessages = {
    technicalIssue:
        'We are sorry! We are experiencing a technical issue and could not process your last request. Please try again.',
    unauthorizedIssue: 'You are not authorized to perform this action.',
    invalidFileSize:  'One or more files are too large to upload.',
    unableToReauthorize:
        "Your Google authorization has expired and we're unable to re-authorize you. Please re-add this connection.",
    imageProccessingIssue:
        'The provided image was not handled successfuly. Please provide another one.',
    imageUploadIssue: 'Failed to upload the profile photo. Please try again.',
    profileUpdateSuccess: 'Your profile was successfully updated.',
    profileUpdateIssue: 'Failed to update the profile data. Please try again.',
    passwordUpdateSuccess: 'The password was successfully updated.',
    gaAddingMetricColumnLimitIssue:
        'Failed to add the metric column because the limit has been reached.',
    gaAddingDimensionColumnLimitIssue:
        'Failed to add the dimension column because the limit has been reached.',
    gaAddingColumnCompatibilityIssue: 'Incompatible column to add. Please try again later.',
    gaTimerFetchingIssue: 'Unable to get event tracker info. Will try again.',
    noGaPropertiesFound:
        "Your Google Analytics account doesn't have Properties. Please add it to your account and repeat the connection.",
    dashboardTilesSavedSuccess: 'Dashboard has been updated successfully.',
    dashboardAddSuccess: 'Dashboard has been added successfully.',
    dashboardUpdateSuccess: 'Dashboard has been updated successfully.',
    dashboardDeleteSuccess: 'Dashboard has been deleted successfully.',
    tileUpdateSuccess: 'Tile has been updated successfully.',
    tileAddSuccess: 'Tile has been added successfully.',
    tileDeleteSuccess: 'Tile has been deleted successfully.'
};

export const UserData = {
    defaultProfilePhotoUrl: 'https://datopus.blob.core.windows.net/users/dae0c6a7-c4b1-4579-8ccb-aa6786728b7c/images/profile'
};

export const OneMinuteMs = 60 * 1000;
export const OneHourMs = 60 * OneMinuteMs;
export const OneDayMs = 24 * OneHourMs;

export const LOCAL_STORAGE_KEYS = {
    GA_DASHBOARD_NEW_SOURCE_DISMISS_ALERT_MESSAGE: 'GA_DASHBOARD_NEW_SOURCE_DISMISS_ALERT_MESSAGE'
};