import { AuthValidation } from "@/App/modules/Auth/auth.validation";
import { Response } from "express";
import { Document, Types } from 'mongoose';
import { z } from "zod";

export enum EUserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum EAccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked',
}

export enum ESocialLoginProvider {
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    APPLE = 'apple',
}

export interface IAuth extends Document {
    name: string;
    email: string;
    profilePicture?: string;
    socialLoginId?: string;
    phone?: string;
    password: string;
    role: EUserRole;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    accountStatus: EAccountStatus;
    is2FaEnabled: boolean;
    twoFactorSecret?: string;
    userId?: string;
    statusNote?: string;
    isSocialLogin?: boolean;
    socialLoginProvider?: ESocialLoginProvider;
}

export type TUserCreatePayload = z.infer<typeof AuthValidation.userCreateZodSchema>


export enum ESessionType {
    LOGIN = 'login',
    LOGIN_FAILED_ATTEMPTS = 'login-failed-attempts',
    LOGIN_2FA = 'login-2fa',
    FORGET_PASSWORD = 'forget-password',
    RESET_PASSWORD = 'reset-password',
    ACCOUNT_VERIFICATION = 'account-verification',
    EMAIL_VERIFICATION = 'email-verification',
    TWO_FACTOR_AUTHENTICATION = 'two-factor-authentication',
}

export type TRedisStoreSessionPayload = {
    sessionId: string,
    sessionType: ESessionType,
    email: string,
    otp?: string,
    url?: string,
    remainingAttempts?: number,
    expiresInMin: number,
    twoFactorSecret?: string,
    loginData?: {
        email: string,
        role: EUserRole,
        _id: string | Types.ObjectId,
    }
}

export type TRedisStoreFailedAttemptsPayload = {
    sessionType: ESessionType;
    email: string;
    blockStatus: "true" | "false";
    blockReason: string;
    blockTime: string;
    attemptsCount: number;
    attemptsRemaining: number;
    attemptsResetTime: string;
    expiresInMin: number;
}

export type TChangeAccountStatusPayload = {
    _id: string | Types.ObjectId,
    status: EAccountStatus,
    statusNote?: string
}

export type TSocialLoginPayload = {
    email: string;
    name: string;
    profilePicture?: string;
    socialLoginId: string;
    socialLoginProvider: ESocialLoginProvider;
}

export type TAfterLoginServicePayload = {
    sessionId: string;
    is2FaEnabled: boolean;
    nextAction?: "login" | "login-2fa";
    res: Response;
}

export const allowedOtpSessionTypes = [ESessionType.ACCOUNT_VERIFICATION, ESessionType.FORGET_PASSWORD, ESessionType.EMAIL_VERIFICATION]