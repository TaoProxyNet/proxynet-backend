// Create index with appropriate field types

import { RedisClient } from "@/Config/redis";
import { ESessionType } from "../../Auth/auth.types";

const createAVFIndex = async () => {
    try {
        const idxKey = `idx:${ESessionType.ACCOUNT_VERIFICATION}`;

        // Get the list of existing indices
        const indices = await RedisClient.call('FT._LIST');
        console.log({ indices });
        if (Array.isArray(indices) && indices.includes(idxKey)) {
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
        console.log("Account verification index created successfully");
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

export const AVFIndexService = {
    createAVFIndex,
}