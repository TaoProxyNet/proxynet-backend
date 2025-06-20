import { RedisClient } from "@/Config/redis"
import { ESessionType } from "../../Auth/auth.types"
import { TResetPasswordSessionCreatePayload } from "../session.types"
import { RedisSessionValidation } from "../session.validation"

const getSessionKey = (sessionType: ESessionType, sessionId: string) => {
    return `${sessionType}:${sessionId}`;
}

//store reset password session
const storeResetPasswordSession = async (payload: TResetPasswordSessionCreatePayload): Promise<boolean> => {
    const validatedPayload = RedisSessionValidation.resetPassword.createPayload.parse(payload)
    const sessionKey = getSessionKey(ESessionType.RESET_PASSWORD, validatedPayload.sessionId)
    await RedisClient.set(sessionKey, validatedPayload.email)
    await RedisClient.expire(sessionKey, validatedPayload.expiresInMin * 60)
    return true
}

//get reset password session
const getResetPasswordSession = async (sessionId: string): Promise<string | null> => {
    const sessionKey = getSessionKey(ESessionType.RESET_PASSWORD, sessionId)
    const session = await RedisClient.get(sessionKey)
    return session ? session : null
}

//delete reset password session
const deleteResetPasswordSession = async (sessionId: string): Promise<boolean> => {
    const sessionKey = getSessionKey(ESessionType.RESET_PASSWORD, sessionId)
    await RedisClient.del(sessionKey)
    return true
}

export const RedisOtherServices = {
    storeResetPasswordSession,
    getResetPasswordSession,
    deleteResetPasswordSession
}