import { z } from "zod";
import { ESessionType } from "../../Auth/auth.types";

const AvfSessionSchema = z.object({
    sessionId: z.string(),
    sessionType: z.literal(ESessionType.ACCOUNT_VERIFICATION),
    email: z.string().email(),
    otp: z.string(),
    url: z.string().url().optional(),
    expiresInMin: z.number(),
    remainingAttempts: z.number(),
});

const AvfCreateSessionPayloadSchema = z.object({
    sessionId: z.string(),
    email: z.string().email(),
    otp: z.string(),
    url: z.string().url().optional(),
    expiresInMin: z.number(),
});

const AvfUpdateSessionPayloadSchema = z.object({
    sessionId: z.string(),
    otp: z.string().optional(),
    url: z.string().url().optional(),
    expiresInMin: z.number().optional(),
    remainingAttempts: z.number().optional(),
});

const AvfDeleteSessionPayloadSchema = z.object({
    sessionId: z.string(),
});

const AvfValidateSessionPayloadSchema = z.object({
    sessionId: z.string(),
    otp: z.string(),
});

export const RedisAvfValidation = {
    AvfSessionSchema,
    AvfCreateSessionPayloadSchema,
    AvfUpdateSessionPayloadSchema,
    AvfDeleteSessionPayloadSchema,
    AvfValidateSessionPayloadSchema,
}