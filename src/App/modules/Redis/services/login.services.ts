import { RedisClient } from "@/Config/redis"
import { AuthServices } from "../../Auth/auth.services"
import { EAccountStatus, ESessionType } from "../../Auth/auth.types"
import { TLoginFailedAttemptsSessionPayload, TLoginSessionCreatePayload, TSessionGetByEmailPayload } from "../session.types"
import { RedisSessionValidation } from "../session.validation"
import { RedisCommonActions } from "./common/actions"


// const getAllSessions = async (sessionType: ESessionType, params: TSessionSearchParams): Promise<TSessionSearchResult> => {
//     console.log("getAllSessions", { params })
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
//         console.log({ queryParts })
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
//         const sessions: TLoginSessionCreatePayload[] = [];
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

const getSessionByEmail = async ({ sessionType, email }: TSessionGetByEmailPayload): Promise<TLoginSessionCreatePayload | null> => {
    const sessions = await LoginSessionServices.getAllSessions({ sessionType, params: { email, page: 1, limit: 5 } })
    const session = sessions.sessions.find(session => session.email === email)
    return session as TLoginSessionCreatePayload ?? null
}

const storeLoginSession = async (payload: TLoginSessionCreatePayload): Promise<boolean> => {
    try {
        const validatedPayload = RedisSessionValidation.login.createPayload.parse(payload)
        // //check if session already exists
        const existingSession = await getSessionByEmail({ sessionType: ESessionType.LOGIN, email: validatedPayload.email })
        if (existingSession) {
            //delete the existing session
            // await RedisClient.del(RedisCommonActions.getSessionKey(ESessionType.LOGIN, existingSession.sessionId))
            await RedisCommonActions.deleteSession({
                sessionType: ESessionType.LOGIN,
                sessionId: existingSession.sessionId
            })
            // return true
        }

        // const key = RedisCommonActions.getSessionKey(ESessionType.LOGIN, validatedPayload.sessionId);
        // const expiresInMin = 60

        // // Store as JSON
        // const data = await RedisClient.call(
        //     'JSON.SET',
        //     key,
        //     '$',
        //     JSON.stringify(validatedPayload)
        // );
        // // Set expiration - default 60 minutes
        // await RedisClient.expire(key, expiresInMin * 60);

        // return true

        return RedisCommonActions.storeSession({
            sessionType: ESessionType.LOGIN,
            sessionId: payload.sessionId,
            expiresInMin: 60,
            data: validatedPayload
        })
    } catch (err) {
        console.log('storeLoginSession error', { err });
        return false
    }
}

const storeFailedLoginAttempts = async ({
    _id,
    email
}: TLoginFailedAttemptsSessionPayload) => {
    console.log({ _id, email })

    const initialRemainingAttempts = 5
    const sessionType = ESessionType.LOGIN_FAILED_ATTEMPTS
    const expiresInMin = 60
    const failedAttemptsKey = `${sessionType}:${email}`

    //1. validate payload
    const validatedPayload = RedisSessionValidation.login.failedAttemptsPayload.parse({ _id, email })
    const session = await RedisClient.get(failedAttemptsKey)
    if (!session) {
        //2. store failed attempts
        // await RedisClient.set(failedAttemptsKey, initialRemainingAttempts)
        // await RedisClient.expire(failedAttemptsKey, expiresInMin * 60)
        /* 
        @todo: initial remaining attempts should be stored in the session
        */
        return RedisCommonActions.storeSession({
            sessionType: ESessionType.LOGIN_FAILED_ATTEMPTS,
            sessionId: email,
            expiresInMin,
            data: validatedPayload
        })
    }
    //3. if already have failed attempts less than 5, then decrement the remaining attempts and if it reaches 0, then block the account
    const remainingAttempts = parseInt(session) - 1
    if (remainingAttempts === 0) {
        //4. block the account
        await AuthServices.changeAccountStatus({
            _id,
            status: EAccountStatus.BLOCKED,
            statusNote: "Account blocked due to too many failed login attempts",
        })
        //5. delete the failed attempts session
        await RedisCommonActions.deleteSession({
            sessionType: ESessionType.LOGIN_FAILED_ATTEMPTS,
            sessionId: email
        })
        return
    } else {
        //5. update the remaining attempts
        // await RedisClient.set(failedAttemptsKey, remainingAttempts)
        // await RedisClient.expire(failedAttemptsKey, expiresInMin * 60)
        return RedisCommonActions.storeSession({
            sessionType: ESessionType.LOGIN_FAILED_ATTEMPTS,
            sessionId: email,
            expiresInMin,
            data: validatedPayload
        })
        // return
    }
}

// const getSession = async ({ sessionType, sessionId }: TSessionGetPayload): Promise<TLoginSessionCreatePayload | null> => {
//     try {
//         const key = RedisCommonActions.getSessionKey(sessionType, sessionId);
//         const data = await RedisClient.call('JSON.GET', key, '$');
//         if (!data) return null;
//         // Redis might return an array with one object, or a stringified object
//         let session: TLoginSessionCreatePayload | null = null;
//         if (typeof data === 'string') {
//             const parsed = JSON.parse(data);
//             // If it's an array (from JSONPath $), get the first element
//             session = Array.isArray(parsed) ? parsed[0] : parsed;
//         } else if (Array.isArray(data)) {
//             session = data[0] ?? null;
//         } else {
//             session = data as TLoginSessionCreatePayload;
//         }
//         return session;
//     } catch (err) {
//         console.log({ err });
//         return null;
//     }
// };

// const deleteSession = async (sessionId: string) => {
//     const key = RedisCommonActions.getSessionKey(ESessionType.LOGIN, sessionId);
//     await RedisClient.del(key)
//     return true
// }

export const LoginSessionServices = {
    storeFailedLoginAttempts,
    storeLoginSession,
    getAllSessions: RedisCommonActions.getAllSessions<TLoginSessionCreatePayload>,
    getSession: RedisCommonActions.getASession<TLoginSessionCreatePayload>,
    getSessionByEmail: getSessionByEmail,
    deleteSession: RedisCommonActions.deleteSession
}