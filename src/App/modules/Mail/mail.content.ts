const otpMailContent = {
    forgetPassword: {
        title: 'Password Reset Code',
        emailHeader: 'Password Reset Request',
        instruction: 'You have requested to reset your password. Please use the following code to complete the process:',
        buttonText: 'Continue Reset Password',
        expireTime: '10 minutes',
        warning: 'If you didn\'t request this change, please ignore this email.'
    },
    accountVerification: {
        title: 'Account Verification Code',
        emailHeader: 'Account Verification',
        instruction: 'Someone created account by this email in T2R SSO. If you create this account intensionally please use the following code to complete the process:',
        buttonText: 'Verify Account',
        expireTime: '10 minutes',
        warning: 'If you didn\'t request this change, please ignore this email.'
    }
}

export const MailContent = {
    otpMailContent
}