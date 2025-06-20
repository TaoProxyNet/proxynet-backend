import { ESessionType } from "@/App/modules/Auth/auth.types";
import { RedisClient } from "@/Config/redis";
import { RedisCommonActions } from ".";
import { RedisCommonValidation } from "../validation";


interface IStoreSessionPayload {
    sessionType: ESessionType
    sessionId: string
    expiresInMin: number
    data: Record<string, any>
}

export const storeSession = async (payload: IStoreSessionPayload): Promise<boolean> => {

    try {
        const validatedPayload = RedisCommonValidation.processValidation({
            sessionType: payload.sessionType,
            actionType: "create",
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
        await RedisClient.expire(key, payload.expiresInMin * 60);

        console.log({ data })
        return true
    } catch (err) {
        console.log({ err });
        return false
    }
}