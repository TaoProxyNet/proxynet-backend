import { RedisClient } from "@/Config/redis";
import { ESessionType, TRedisStoreFailedAttemptsPayload, TRedisStoreSessionPayload } from "./auth.types";
import { HashHelper } from "@/Utils/helper/hashHelper";



const storeASession = async (payload: TRedisStoreSessionPayload) => {

    try {
        const key = `${payload.sessionType}:${payload.sessionId}`;
        let sessionData: Partial<TRedisStoreSessionPayload> = {
            email: payload.email,
            otp: payload.otp,
            url: payload.url,
            remainingAttempts: 5,
        }
        if (payload.twoFactorSecret) {
            sessionData.twoFactorSecret = await HashHelper.generateHashPassword(payload.twoFactorSecret)
        }
        const data = await RedisClient.multi()
            .hset(key, sessionData)
            .expire(key, payload.expiresInMin * 60)
            .exec()

        console.log({ data })
    } catch (err) {
        console.log({ err });
    }
}

const getSession = async (sessionType: ESessionType, sessionId: string) => {
    const key = `${sessionType}:${sessionId}`;
    return RedisClient.hgetall(key);
}

const validateOTP = async (sessionType: ESessionType, sessionId: string, otp: string) => {
    const key = `${sessionType}:${sessionId}`;
    const storedOTP = await RedisClient.hget(key, 'otp');
    return storedOTP === otp;
}

const deleteSession = async (sessionType: ESessionType, sessionId: string) => {
    const key = `${sessionType}:${sessionId}`;
    return RedisClient.del(key);
}

const sessionExists = async (sessionType: ESessionType, sessionId: string) => {
    const key = `${sessionType}:${sessionId}`;
    return RedisClient.exists(key);
}

const updateSession = async (
    sessionType: ESessionType,
    sessionId: string,
    updateData: Partial<{ email: string; otp: string; url: string, remainingAttempts: number }>,
    expiresInMin: number
) => {
    const key = `${sessionType}:${sessionId}`;

    try {
        const multi = RedisClient.multi().hset(key, updateData);

        // If expiration time is provided, update it
        if (expiresInMin) {
            multi.expire(key, expiresInMin * 60);
        }

        const result = await multi.exec();
        return result;
    } catch (err) {
        console.log({ err });
        throw err;
    }
};

// const updateBlockStatus = async ({
//     sessionType,
//     email,
// }: {
//     sessionType: ESessionType,
//     email: string
// }) => {
//     const key = `${sessionType}:${email}`;
//     const payload = {
//         sessionType,
//         email,
//         blockStatus: false,
//         blockReason: 'max attempts reached. please try again after 12 hours.',
//         blockTime: new Date().toISOString(),
//         attemptsCount: 0,
//         attemptsRemaining: 5,
//         attemptsResetTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
//     }
//     const data = await RedisClient.multi()
//         .hset(key, payload)
//         .expire(key, 12 * 60 * 60)
//         .exec()
//     return data;
// }

const storeFailedAttempts = async ({
    sessionType,
    email,
    attemptsCount,
    attemptsRemaining,
    attemptsResetTime,
    blockStatus,
    blockReason,
    blockTime,
    expiresInMin
}: TRedisStoreFailedAttemptsPayload) => {
    const key = `${sessionType}:${email}`;
    const payload = {
        sessionType,
        email,
        blockStatus,
        blockReason,
        blockTime,
        attemptsCount,
        attemptsRemaining,
        attemptsResetTime,
    }
    const data = await RedisClient.multi()
        .hset(key, payload)
        .expire(key, expiresInMin * 60)
        .exec()
    return data;
}

const getFailedAttempts = async (sessionType: ESessionType, email: string) => {
    const key = `${sessionType}:${email}`;
    return RedisClient.hgetall(key);
}

export const AuthRedisServices = {
    storeASession,
    getSession,
    validateOTP,
    deleteSession,
    sessionExists,
    updateSession,
    getFailedAttempts,
    storeFailedAttempts
}