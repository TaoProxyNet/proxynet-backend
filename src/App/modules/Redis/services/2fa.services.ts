import { RedisClient } from "@/Config/redis"
import { TSessionGetPayload, TTwoFactorAuthenticationSessionCreatePayload } from "../session.types"
import { RedisSessionValidation } from "../session.validation"
import { RedisCommonActions } from "./common/actions"



//store 2fa session
const store2FaSession = async (payload: TTwoFactorAuthenticationSessionCreatePayload): Promise<boolean> => {
    const validatedPayload = RedisSessionValidation.twoFactorAuthentication.createPayload.parse(payload)
    const sessionKey = RedisCommonActions.getSessionKey(payload.sessionType, validatedPayload.sessionId)
    await RedisClient.call('JSON.SET', sessionKey, '$', JSON.stringify(validatedPayload))
    await RedisClient.expire(sessionKey, validatedPayload.expiresInMin * 60)
    return true
}

//get 2fa session
// const get2FaSession = async ({ sessionType, sessionId }: TSessionGetPayload): Promise<TTwoFactorAuthenticationSessionCreatePayload | null> => {
//     const sessionKey = RedisCommonActions.getSessionKey(sessionType, sessionId)
//     const data = await RedisClient.call('JSON.GET', sessionKey, '$');
//     if (!data) return null;
//     // Redis might return an array with one object, or a stringified object
//     let session: TTwoFactorAuthenticationSessionCreatePayload | null = null;
//     if (typeof data === 'string') {
//         const parsed = JSON.parse(data);
//         // If it's an array (from JSONPath $), get the first element
//         session = Array.isArray(parsed) ? parsed[0] : parsed;
//     } else if (Array.isArray(data)) {
//         session = data[0] ?? null;
//     } else {
//         session = data as TTwoFactorAuthenticationSessionCreatePayload;
//     }
//     return session;
// }

//delete 2fa session

// const delete2FaSession = async ({ sessionType, sessionId }: TSessionGetPayload): Promise<boolean> => {
//     const sessionKey = RedisCommonActions.getSessionKey(sessionType, sessionId)
//     await RedisClient.del(sessionKey)
//     return true
// }

export const TwoFactorAuthenticationServices = {
    store2FaSession,
    get2FaSession: RedisCommonActions.getASession<TTwoFactorAuthenticationSessionCreatePayload>,
    delete2FaSession: RedisCommonActions.deleteSession
}