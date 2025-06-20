import { z } from "zod";
import { ESessionType } from "../../Auth/auth.types";


const AvfCreateZodSchema = z.object({
    sessionId: z.string(),
    email: z.string().email(),
    otp: z.string(),
    url: z.string().url().optional(),
    expiresInMin: z.number(),
});

const AvfUpdateZodSchema = z.object({
    sessionId: z.string(),
    otp: z.string().optional(),
    url: z.string().url().optional(),
    expiresInMin: z.number().optional(),
    remainingAttempts: z.number().optional(),
});

const AvfDeleteZodSchema = z.object({
    sessionId: z.string(),
});

const AvfValidateZodSchema = z.object({
    sessionId: z.string(),
    otp: z.string(),
});

export const RedisAvfValidation = {
    AvfCreateZodSchema,
    AvfUpdateZodSchema,
    AvfDeleteZodSchema,
    AvfValidateZodSchema,
}