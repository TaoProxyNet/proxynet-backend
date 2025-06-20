import { ESessionType, ESocialLoginProvider, EUserRole } from "@/App/modules/Auth/auth.types";
import { Types } from "mongoose";
import { z } from "zod";

const userCreateZodSchema = z.object({
    name: z.string(),
    email: z.string().email().transform(val => val.toLowerCase()),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([EUserRole.ADMIN, EUserRole.USER]).default(EUserRole.USER),
    isSocialLogin: z.boolean().optional(),
    socialLoginProvider: z.nativeEnum(ESocialLoginProvider).optional(),
    profilePicture: z.string().optional(),
    socialLoginId: z.string().optional()
});

const userLoginZodSchema = z.object({
    email: z.string().email().transform(val => val.toLowerCase()),
    password: z.string()
});

const redisStoreFailedAttemptsZodSchema = z.object({
    sessionType: z.nativeEnum(ESessionType),
    email: z.string().email().transform(val => val.toLowerCase()),
    blockStatus: z.enum(["true", "false"]),
    blockReason: z.string(),
    blockTime: z.string(),
    attemptsCount: z.number(),
    attemptsRemaining: z.number(),
    attemptsResetTime: z.string(),
    expiresInMin: z.number()
});

const disable2FaZodSchema = z.object({
    otp: z.string(),
    _id: z.string().transform(val => new Types.ObjectId(val))
});

const enable2FaZodSchema = z.object({
    otp: z.string(),
    sessionId: z.string(),
    _id: z.string().transform(val => new Types.ObjectId(val))
});

const generate2FaSessionZodSchema = z.object({
    _id: z.string().transform(val => new Types.ObjectId(val))
});

const resetPasswordZodSchema = z.object({
    sessionId: z.string(),
    password: z.string().min(6)
});

export const AuthValidation = {
    userCreateZodSchema,
    userLoginZodSchema,
    redisStoreFailedAttemptsZodSchema,
    generate2FaSessionZodSchema,
    enable2FaZodSchema,
    disable2FaZodSchema,
    resetPasswordZodSchema
};
