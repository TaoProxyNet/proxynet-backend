import { ESessionType } from "@/App/modules/Auth/auth.types";
import { RedisClient } from "@/Config/redis";
import { TSessionSearchParams } from "../../../session.types";

type TGetAllSessionsPayload = {
    sessionType: ESessionType,
    params: TSessionSearchParams
}

type TSessionSearchResult<T> = {
    sessions: T[]; // or other session types
    meta: {
        total: number;
        page: number;
        limit: number;
    }
}

export const getAllSessions = async <T>({ sessionType, params }: TGetAllSessionsPayload): Promise<TSessionSearchResult<T>> => {
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
            'FT.SEARCH', `idx:${sessionType}`,
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
        const sessions: T[] = [];
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