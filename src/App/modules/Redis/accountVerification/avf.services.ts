import { RedisClient } from "@/Config/redis";
import { ESessionType } from "../../Auth/auth.types";
import { TAvfCreatePayload, TAvfSearchParams, TAvfSearchResult, TAvfSession, TAvfUpdatePayload, TAvfValidatePayload } from "./avf.types";
import { RedisAvfValidation } from "./avf.validation";

const getSessionKey = (sessionId: string) => {
    return `${ESessionType.ACCOUNT_VERIFICATION}:${sessionId}`;
}

const getAllSessions = async (params: TAvfSearchParams): Promise<TAvfSearchResult> => {
    const { email, sessionId, page = 1, limit = 10 } = params;
    const offset = ((page - 1) * limit).toString(); //offset is the number of records to skip

    try {
        // Build search query
        let queryParts: string[] = [];
        if (email) {
            //with regex, remove all non-alphanumeric characters and split by space(remove all special characters)
            const tokens = email.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/).filter(Boolean);
            queryParts.push(`@email:(${tokens.join(' ')})`);
        }
        if (sessionId) {
            queryParts.push(`@sessionId:{${sessionId}}`);
        }
        // If no conditions provided, search all
        const searchQuery = queryParts.length > 0 ? queryParts.join(' ') : '*';

        const args = [
            'FT.SEARCH', `idx:${ESessionType.ACCOUNT_VERIFICATION}`,
            searchQuery,
            // 'SORTBY', sortBy, sortOrder,
            'LIMIT', offset, limit.toString(),
            'RETURN', '1', '$'
        ] as const;

        const searchResult = await RedisClient.call(...args) as any[];

        /* example of searchResult:
                searchResult: [
                    1, //total number of results
                    'account-verification:4', //key of the first result
                    [
                    '$', //type of the result
                    '{"sessionId":"4","email":"a@b.com","otp":"123456","url":"","remainingAttempts":5}' //json of the first result
                    ]
                ]
        */

        const total = searchResult[0] || 0;
        const sessions: TAvfSession[] = [];
        for (let i = 1; i < searchResult.length; i += 2) {
            const jsonArr = searchResult[i + 1];
            const jsonStr = Array.isArray(jsonArr) ? jsonArr[1] : null;
            if (jsonStr) {
                const parsed = JSON.parse(jsonStr);
                sessions.push(parsed);
            }
        }

        return { sessions, meta: { total, page, limit } };
    } catch (err) {
        console.log({ err });
        return { sessions: [], meta: { total: 0, page, limit } };
    }
};

// Get a single session by sessionId
const getASession = async (sessionId: string): Promise<TAvfSession | null> => {
    try {
        const key = getSessionKey(sessionId);
        const data = await RedisClient.call('JSON.GET', key, '$');
        if (!data) return null;
        // Redis might return an array with one object, or a stringified object
        let session: TAvfSession | null = null;
        if (typeof data === 'string') {
            const parsed = JSON.parse(data);
            // If it's an array (from JSONPath $), get the first element
            session = Array.isArray(parsed) ? parsed[0] : parsed;
        } else if (Array.isArray(data)) {
            session = data[0] ?? null;
        } else {
            session = data as TAvfSession;
        }
        return session;
    } catch (err) {
        console.log({ err });
        return null;
    }
};


const createSession = async (payload: TAvfCreatePayload): Promise<boolean> => {
    const validatedPayload = RedisAvfValidation.AvfCreateZodSchema.parse(payload)
    console.log({ validatedPayload })
    try {
        const key = getSessionKey(validatedPayload.sessionId);
        const sessionData: Partial<TAvfSession> = {
            sessionId: validatedPayload.sessionId,
            email: validatedPayload.email,
            otp: validatedPayload.otp,
            url: validatedPayload.url ?? "",
            remainingAttempts: 5,
        }

        // Store as JSON
        const data = await RedisClient.call(
            'JSON.SET',
            key,
            '$',
            JSON.stringify(sessionData)
        );
        // Set expiration
        await RedisClient.expire(key, validatedPayload.expiresInMin * 60);

        console.log({ data })
        return true
    } catch (err) {
        console.log({ err });
        return false
    }
}

const updateSession = async (payload: TAvfUpdatePayload) => {
    const validatedPayload = RedisAvfValidation.AvfUpdateZodSchema.parse(payload)
    try {
        const key = getSessionKey(validatedPayload.sessionId);

        // Prepare the fields to update
        const updates: Record<string, any> = {};
        if (validatedPayload.otp !== undefined) updates.otp = validatedPayload.otp;
        if (validatedPayload.url !== undefined) updates.url = validatedPayload.url;
        if (validatedPayload.remainingAttempts !== undefined) updates.remainingAttempts = validatedPayload.remainingAttempts;
        console.log({ updates })

        // Update only the provided fields using JSON.SET for each
        for (const [field, value] of Object.entries(updates)) {
            await RedisClient.call('JSON.SET', key, `$.${field}`, JSON.stringify(value));
        }

        // Set expiration if provided
        if (validatedPayload.expiresInMin !== undefined) {
            await RedisClient.expire(key, validatedPayload.expiresInMin * 60);
        }

        console.log({ updates })
    } catch (err) {
        console.log({ err });
    }
}

const deleteSession = async (sessionId: string) => {
    const validatedPayload = RedisAvfValidation.AvfDeleteZodSchema.parse({ sessionId })
    try {
        const key = getSessionKey(validatedPayload.sessionId);
        const data = await RedisClient.del(key)
        console.log({ data })
        return data > 0
    } catch (err) {
        console.log({ err });
        return false
    }
}

const validateSession = async (payload: TAvfValidatePayload) => {
    const validatedPayload = RedisAvfValidation.AvfValidateZodSchema.parse(payload)
    try {
        const data = await getASession(validatedPayload.sessionId)
        console.log({ data })
        return data?.otp === validatedPayload.otp
    } catch (err) {
        console.log({ err });
        return false
    }
}

export const AvfRedisServices = {
    createSession,
    updateSession,
    deleteSession,
    validateSession,
    getASession,
    getAllSessions,
}