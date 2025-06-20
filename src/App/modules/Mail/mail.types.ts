export enum EOtpType {
    FORGET_PASSWORD = 'forgetPassword',
    ACCOUNT_VERIFICATION = 'accountVerification',
}

export type TOtpTemplatePayload = {
    mailFor: EOtpType,
    code: string,
    url: string
}