import { z } from "zod";
import { ESessionType } from "../../Auth/auth.types";
import { RedisAvfValidation } from "./avf.validation";

/* 
        sessionId,
        sessionType: ESessionType.ACCOUNT_VERIFICATION,
        email: payload.email,
        otp,
        url: verifyUrl,
        expiresInMin: 10,
*/
export type TAvfSession = {
    sessionId: string;
    sessionType: ESessionType.ACCOUNT_VERIFICATION;
    email: string;
    otp: string;
    url?: string;
    expiresInMin: number;
    remainingAttempts: number;
}


export type TAvfCreatePayload = z.infer<typeof RedisAvfValidation.AvfCreateZodSchema>
export type TAvfUpdatePayload = z.infer<typeof RedisAvfValidation.AvfUpdateZodSchema>
export type TAvfDeletePayload = z.infer<typeof RedisAvfValidation.AvfDeleteZodSchema>
export type TAvfValidatePayload = z.infer<typeof RedisAvfValidation.AvfValidateZodSchema>

export type TAvfSearchParams = {
    email?: string;
    sessionId?: string;
    page?: number;
    limit?: number;
}
export type TAvfSearchResult = {
    sessions: TAvfSession[];
    meta: {
        total: number;
        page: number;
        limit: number;
    }
}