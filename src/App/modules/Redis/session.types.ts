import { z } from "zod";
import { ESessionType } from "../Auth/auth.types";
import { RedisSessionValidation } from "./session.validation";

/* 
        sessionId,
        sessionType: ESessionType.ACCOUNT_VERIFICATION,
        email: payload.email,
        otp,
        url: verifyUrl,
        expiresInMin: 10,
*/
export type TOtpGroupSession = {
    sessionId: string;
    sessionType: ESessionType;
    email: string;
    otp: string;
    redirectUrl?: string;
    remainingAttempts?: number;
    blockStatus: "true" | "false";
    blockReason?: string;
    blockResetTime?: string;
    blockActiveTime?: string;
}

export enum RedisSessionGroup {
    OTP_SESSION_GROUP = 'otp-session-group',
    LOGIN_SESSION_GROUP = 'login-session-group',
    RESET_PASSWORD_SESSION_GROUP = 'reset-password-session-group',
}

//session get by email
export type TSessionGetByEmailPayload = {
    sessionType: ESessionType;
    email: string;
}
//session get by id
export type TSessionGetPayload = {
    sessionType: ESessionType;
    sessionId: string;
}
//otp group session
export type TOtpGroupSessionCreatePayload = z.infer<typeof RedisSessionValidation.otp.createPayload>
export type TOtpGroupSessionUpdatePayload = z.infer<typeof RedisSessionValidation.otp.updatePayload>
export type TOtpGroupSessionDeletePayload = z.infer<typeof RedisSessionValidation.otp.deletePayload>
export type TOtpGroupSessionValidatePayload = z.infer<typeof RedisSessionValidation.otp.validatePayload>
//login group session
export type TLoginSessionCreatePayload = z.infer<typeof RedisSessionValidation.login.createPayload>
export type TLoginFailedAttemptsSessionPayload = z.infer<typeof RedisSessionValidation.login.failedAttemptsPayload>
//reset password group session
export type TResetPasswordSessionCreatePayload = z.infer<typeof RedisSessionValidation.resetPassword.createPayload>
//2fa group session
export type TTwoFactorAuthenticationSessionCreatePayload = z.infer<typeof RedisSessionValidation.twoFactorAuthentication.createPayload>

//session search params
export type TSessionSearchParams = {
    email?: string;
    sessionId?: string;
    page?: number;
    limit?: number;
}

//session search result
export type TSessionSearchResult = {
    sessions: TOtpGroupSession[] | TLoginSessionCreatePayload[]; // or other session types
    meta: {
        total: number;
        page: number;
        limit: number;
    }
}