import { RedisClient } from "@/Config/redis";
import { TSessionGetPayload } from "../../../session.types";
import { getSessionKey } from "./getSessionKey";

export const getASession = async <T>({ sessionType, sessionId }: TSessionGetPayload): Promise<T | null> => {
    try {
        const key = getSessionKey(sessionType, sessionId);
        const data = await RedisClient.call('JSON.GET', key, '$');
        if (!data) return null;
        // Redis might return an array with one object, or a stringified object
        let session: T | null = null;
        if (typeof data === 'string') {
            const parsed = JSON.parse(data);
            // If it's an array (from JSONPath $), get the first element
            session = Array.isArray(parsed) ? parsed[0] : parsed;
        } else if (Array.isArray(data)) {
            session = data[0] ?? null;
        } else {
            session = data as T;
        }
        return session;
    } catch (err) {
        console.log({ err });
        return null;
    }
};
