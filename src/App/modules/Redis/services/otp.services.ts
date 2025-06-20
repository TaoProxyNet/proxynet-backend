import { RedisClient } from "@/Config/redis";
import { TOtpGroupSession, TOtpGroupSessionCreatePayload, TOtpGroupSessionUpdatePayload, TOtpGroupSessionValidatePayload, TSessionGetByEmailPayload } from "../session.types";
import { RedisSessionValidation } from "../session.validation";
import { RedisCommonActions } from "./common/actions";



// const getAllSessions = async (sessionType: ESessionType, params: TSessionSearchParams): Promise<TSessionSearchResult> => {
//     const { email, sessionId, page = 1, limit = 10 } = params;
//     const offset = ((page - 1) * limit).toString(); //offset is the number of records to skip

//     try {
//         // Build search query
//         let queryParts: string[] = [];
//         if (email) {
//             //with regex, remove all non-alphanumeric characters and split by space(remove all special characters)
//             const tokens = email.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/).filter(Boolean);
//             queryParts.push(`@email:(${tokens.join(' ')})`);
//         }
//         if (sessionId) {
//             queryParts.push(`@sessionId:{${sessionId}}`);
//         }
//         // If no conditions provided, search all
//         const searchQuery = queryParts.length > 0 ? queryParts.join(' ') : '*';

//         const args = [
//             'FT.SEARCH', `idx:${sessionType}`,
//             searchQuery,
//             // 'SORTBY', sortBy, sortOrder,
//             'LIMIT', offset, limit.toString(),
//             'RETURN', '1', '$'
//         ] as const;

//         const searchResult = await RedisClient.call(...args) as any[];

//         /* example of searchResult:
//                 searchResult: [
//                     1, //total number of results
//                     'account-verification:4', //key of the first result
//                     [
//                     '$', //type of the result
//                     '{"sessionId":"4","email":"a@b.com","otp":"123456","url":"","remainingAttempts":5}' //json of the first result
//                     ]
//                 ]
//         */

//         const total = searchResult[0] || 0;
//         const sessions: TOtpGroupSession[] = [];
//         for (let i = 1; i < searchResult.length; i += 2) {
//             const jsonArr = searchResult[i + 1];
//             const jsonStr = Array.isArray(jsonArr) ? jsonArr[1] : null;
//             if (jsonStr) {
//                 const parsed = JSON.parse(jsonStr);
//                 sessions.push(parsed);
//             }
//         }

//         return { sessions, meta: { total, page, limit } };
//     } catch (err) {
//         console.log({ err });
//         return { sessions: [], meta: { total: 0, page, limit } };
//     }
// };

// Get a single session by sessionId
// const getASession = async ({ sessionType, sessionId }: TSessionGetPayload): Promise<TOtpGroupSession | null> => {
//     try {
//         const key = RedisCommonActions.getSessionKey(sessionType, sessionId);
//         const data = await RedisClient.call('JSON.GET', key, '$');
//         if (!data) return null;
//         // Redis might return an array with one object, or a stringified object
//         let session: TOtpGroupSession | null = null;
//         if (typeof data === 'string') {
//             const parsed = JSON.parse(data);
//             // If it's an array (from JSONPath $), get the first element
//             session = Array.isArray(parsed) ? parsed[0] : parsed;
//         } else if (Array.isArray(data)) {
//             session = data[0] ?? null;
//         } else {
//             session = data as TOtpGroupSession;
//         }
//         return session;
//     } catch (err) {
//         console.log({ err });
//         return null;
//     }
// };

const getSessionByEmail = async ({ sessionType, email }: TSessionGetByEmailPayload): Promise<TOtpGroupSession | null> => {
    const sessions = await OtpSessionServices.getAllSessions({
        sessionType,
        params: { email, page: 1, limit: 5 }
    })
    const session = sessions.sessions.find(session => session.email === email)
    return session ?? null
}


const createSession = async (payload: TOtpGroupSessionCreatePayload): Promise<boolean> => {
    // const validatedPayload = RedisSessionValidation.otp.createPayload.parse(payload)
    // console.log({ validatedPayload })
    // try {
    //     const key = RedisCommonActions.getSessionKey(validatedPayload.sessionType, validatedPayload.sessionId);

    //     // Store as JSON
    //     const data = await RedisClient.call(
    //         'JSON.SET',
    //         key,
    //         '$',
    //         JSON.stringify(validatedPayload)
    //     );
    //     // Set expiration - default 10 minutes
    //     await RedisClient.expire(key, validatedPayload.expiresInMin * 60);

    //     console.log({ data })
    //     return true
    // } catch (err) {
    //     console.log({ err });
    //     return false
    // }
    return RedisCommonActions.storeSession({
        sessionType: payload.sessionType,
        sessionId: payload.sessionId,
        expiresInMin: payload.expiresInMin,
        data: payload
    })
}

const updateSession = async (payload: TOtpGroupSessionUpdatePayload) => {
    const validatedPayload = RedisSessionValidation.otp.updatePayload.parse(payload)
    try {
        const key = RedisCommonActions.getSessionKey(validatedPayload.sessionType, validatedPayload.sessionId);

        // Prepare the fields to update
        const updates: Record<string, any> = {};
        if (validatedPayload.otp !== undefined) updates.otp = validatedPayload.otp;
        if (validatedPayload.redirectUrl !== undefined) updates.redirectUrl = validatedPayload.redirectUrl;
        if (validatedPayload.remainingAttempts !== undefined) {
            updates.remainingAttempts = validatedPayload.remainingAttempts;
            if (validatedPayload.remainingAttempts === 0) {
                const currentTime = new Date();
                updates.blockStatus = "true";
                updates.blockReason = "Too many failed attempts";
                updates.blockResetTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); //24 hours
                updates.blockActiveTime = currentTime;
            }
        }
        console.log({ updates })

        // Update only the provided fields using JSON.SET for each
        for (const [field, value] of Object.entries(updates)) {
            await RedisClient.call('JSON.SET', key, `$.${field}`, JSON.stringify(value));
        }

        // Set expiration if provided
        await RedisClient.expire(key, validatedPayload.expiresInMin * 60);

        console.log({ updates })
        return true
    } catch (err) {
        console.log({ err });
        return false
    }
}

// const deleteSession = async (payload: TOtpGroupSessionDeletePayload) => {
//     const validatedPayload = RedisSessionValidation.otp.deletePayload.parse(payload)
//     try {
//         const key = RedisCommonActions.getSessionKey(validatedPayload.sessionType, validatedPayload.sessionId);
//         const data = await RedisClient.del(key)
//         console.log({ data })
//         return data > 0
//     } catch (err) {
//         console.log({ err });
//         return false
//     }
// }

const validateSession = async (payload: TOtpGroupSessionValidatePayload) => {
    const validatedPayload = RedisSessionValidation.otp.validatePayload.parse(payload)
    try {
        const session = await OtpSessionServices.getASession({
            sessionType: validatedPayload.sessionType,
            sessionId: validatedPayload.sessionId
        })
        console.log({ session })
        if (!session) return false
        return session.otp === validatedPayload.otp
    } catch (err) {
        console.log({ err });
        return false
    }
}

export const OtpSessionServices = {
    createSession,
    updateSession,
    deleteSession: RedisCommonActions.deleteSession,
    validateSession,
    getASession: RedisCommonActions.getASession<TOtpGroupSession>,
    getAllSessions: RedisCommonActions.getAllSessions<TOtpGroupSession>,
    getSessionByEmail: getSessionByEmail,
}