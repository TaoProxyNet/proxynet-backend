import { ESessionType } from "@/App/modules/Auth/auth.types";
import { RedisClient } from "@/Config/redis";
import { RedisCommonActions } from ".";
import { RedisCommonValidation } from "../validation";


interface IUpdateSessionPayload {
    sessionType: ESessionType
    sessionId: string
    expiresInMin?: number
    data: Record<string, any>
}

export const updateSession = async (payload: IUpdateSessionPayload): Promise<boolean> => {

    try {
        const validatedPayload = RedisCommonValidation.processValidation({
            sessionType: payload.sessionType,
            actionType: "update",
            data: payload.data
        })
        console.log({ validatedPayload })

        const key = RedisCommonActions.getSessionKey(payload.sessionType, payload.sessionId);

        // Store as JSON
        const data = await RedisClient.call(
            'JSON.SET',
            key,
            '$',
            JSON.stringify(validatedPayload)
        );

        // Set expiration - default 10 minutes
        if (payload.expiresInMin) {
            await RedisClient.expire(key, payload.expiresInMin * 60);
        }

        console.log({ data })
        return true
    } catch (err) {
        console.log({ err });
        return false
    }
}

// const updateOtpSession = async <T>(payload: T): Promise<boolean> => {
//     const validatedPayload = RedisSessionValidation.otp.updatePayload.parse(payload)
//     try {
//         const key = getSessionKey(validatedPayload.sessionType, validatedPayload.sessionId);

//         // Prepare the fields to update
//         const updates: Record<string, any> = {};
//         if (validatedPayload.otp !== undefined) updates.otp = validatedPayload.otp;
//         if (validatedPayload.redirectUrl !== undefined) updates.redirectUrl = validatedPayload.redirectUrl;
//         if (validatedPayload.remainingAttempts !== undefined) {
//             updates.remainingAttempts = validatedPayload.remainingAttempts;
//             if (validatedPayload.remainingAttempts === 0) {
//                 const currentTime = new Date();
//                 updates.blockStatus = "true";
//                 updates.blockReason = "Too many failed attempts";
//                 updates.blockResetTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); //24 hours
//                 updates.blockActiveTime = currentTime;
//             }
//         }
//         console.log({ updates })

//         // Update only the provided fields using JSON.SET for each
//         for (const [field, value] of Object.entries(updates)) {
//             await RedisClient.call('JSON.SET', key, `$.${field}`, JSON.stringify(value));
//         }

//         // Set expiration if provided
//         await RedisClient.expire(key, validatedPayload.expiresInMin * 60);

//         console.log({ updates })
//         return true
//     } catch (err) {
//         console.log({ err });
//         return false
//     }
// }