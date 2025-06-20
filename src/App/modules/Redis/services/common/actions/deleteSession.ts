import { RedisClient } from "@/Config/redis"
import { ESessionType } from "@/App/modules/Auth/auth.types"
import { getSessionKey } from "./getSessionKey"

type TDeleteSessionPayload = {
    sessionType: ESessionType,
    sessionId: string
}

export const deleteSession = async ({ sessionType, sessionId }: TDeleteSessionPayload): Promise<boolean> => {
    const sessionKey = getSessionKey(sessionType, sessionId)
    await RedisClient.del(sessionKey)
    return true
}