import { RedisClient } from "@/Config/redis";
import { ESessionType } from "../../Auth/auth.types";

/* 
    @description: This function will create index on session id and email only for the given session type
    @param: sessionType: ESessionType
    @return: void
*/
const createIndex = async (sessionType: ESessionType) => {
    try {
        const idxKey = `idx:${sessionType}`;

        // Get the list of existing indexes
        const indexes = await RedisClient.call('FT._LIST');
        console.log({ indexes });
        if (Array.isArray(indexes) && indexes.includes(idxKey)) {
            console.log("Index already exists");
            return;
        }
        const res = await RedisClient.call(
            'FT.CREATE', idxKey,
            'ON', 'JSON',
            'PREFIX', '1', idxKey,
            'SCHEMA',
            'sessionId', 'TAG', //Tag - for exact match
            'email', 'TEXT', //Text - for partial text search
        );
        console.log({ res });
        console.log(`${sessionType} index created successfully`);
    } catch (err: any) {
        console.log({ err });
        if (err.message && err.message.includes('Index already exists')) {
            console.log("Index already exists");
        } else {
            console.error("Error creating index:", err);
            throw err;
        }
    }
}

/* 
    @description: This function will create index for the login session only
    @return: void
*/
const createLoginIndex = async () => {
    try {
        const idxKey = `idx:${ESessionType.LOGIN}`;

        // Get the list of existing indexes
        const indexes = await RedisClient.call('FT._LIST');
        console.log({ indexes });
        if (Array.isArray(indexes) && indexes.includes(idxKey)) {
            console.log("Index already exists");
            return;
        }
        const res = await RedisClient.call(
            'FT.CREATE', idxKey,
            'ON', 'JSON',
            'PREFIX', '1', idxKey,
            'SCHEMA',
            'sessionId', 'TAG', //Tag - for exact match
            'email', 'TAG', //Tag - for exact match
        );
        console.log({ res });
        console.log(`${ESessionType.LOGIN} index created successfully`);
    } catch (err: any) {
        console.log({ err });
        if (err.message && err.message.includes('Index already exists')) {
            console.log("Index already exists");
        } else {
            console.error("Error creating index:", err);
            throw err;
        }
    }
}

export const RedisDBIndexServices = {
    createIndex,
    createLoginIndex,
}