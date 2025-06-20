import { Types } from "mongoose";
import { z } from "zod";
import { ESessionType, EUserRole } from "../Auth/auth.types";



//otp session
const OtpSessionCreateZodSchema = z.object({
    sessionId: z.string(),
    sessionType: z.nativeEnum(ESessionType),
    email: z.string().email(),
    otp: z.string(),
    redirectUrl: z.string().url().optional(),
    blockStatus: z.enum(["true", "false"]).default("false"),
    blockReason: z.string().optional(),
    blockResetTime: z.string().optional(),
    blockActiveTime: z.string().optional(),
    remainingAttempts: z.number().default(5),
    expiresInMin: z.number().default(10),
});
const OtpSessionUpdateZodSchema = z.object({
    sessionId: z.string(),
    sessionType: z.nativeEnum(ESessionType),
    otp: z.string().optional(),
    redirectUrl: z.string().url().optional(),
    blockStatus: z.enum(["true", "false"]).optional(),
    blockReason: z.string().optional(),
    blockResetTime: z.string().optional(),
    blockActiveTime: z.string().optional(),
    remainingAttempts: z.number().optional(),
    expiresInMin: z.number().default(10),
});
const OtpSessionDeleteZodSchema = z.object({
    sessionId: z.string(),
    sessionType: z.nativeEnum(ESessionType),
});
const OtpSessionValidateZodSchema = z.object({
    sessionId: z.string(),
    sessionType: z.nativeEnum(ESessionType),
    otp: z.string(),
});


//login session
const LoginSessionCreateZodSchema = z.object({
    sessionId: z.string(),
    email: z.string().email(),
    _id: z.instanceof(Types.ObjectId),
    role: z.nativeEnum(EUserRole),
    createdAt: z.date(),
});

const LoginFailedAttemptsZodSchema = z.object({
    _id: z.instanceof(Types.ObjectId),
    email: z.string().email(),
    // remainingAttempts: z.number().optional(),
    // expiresInMin: z.number().optional(),
});

//reset password session
const ResetPasswordSessionCreateZodSchema = z.object({
    sessionId: z.string(),
    email: z.string().email(),
    expiresInMin: z.number().default(5),
});

//2fa session
const TwoFactorAuthenticationSessionCreateZodSchema = z.object({
    sessionId: z.string(),
    email: z.string().email(),
    secret: z.string(),
    expiresInMin: z.number(),
    remainingAttempts: z.number(),
    sessionType: z.enum([ESessionType.TWO_FACTOR_AUTHENTICATION, ESessionType.LOGIN_2FA]),
    metadata: z.record(z.string(), z.any()).optional(),
});
const TwoFactorAuthenticationSessionValidateZodSchema = z.object({
    sessionId: z.string(),
    sessionType: z.enum([ESessionType.TWO_FACTOR_AUTHENTICATION, ESessionType.LOGIN_2FA]),
    secret: z.string(),
    remainingAttempts: z.number(),
    expiresInMin: z.number(),
    metadata: z.record(z.string(), z.any()).optional(),
});


export const RedisSessionValidation = {
    otp: {
        createPayload: OtpSessionCreateZodSchema,
        updatePayload: OtpSessionUpdateZodSchema,
        deletePayload: OtpSessionDeleteZodSchema,
        validatePayload: OtpSessionValidateZodSchema,
    },
    login: {
        createPayload: LoginSessionCreateZodSchema,
        failedAttemptsPayload: LoginFailedAttemptsZodSchema,
    },
    resetPassword: {
        createPayload: ResetPasswordSessionCreateZodSchema,
    },
    twoFactorAuthentication: {
        createPayload: TwoFactorAuthenticationSessionCreateZodSchema,
        validatePayload: TwoFactorAuthenticationSessionValidateZodSchema,
    }
}


