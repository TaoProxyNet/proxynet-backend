import { deleteSession } from "./deleteSession";
import { getAllSessions } from "./getAllSessions";
import { getASession } from "./getASession";
import { getSessionKey } from "./getSessionKey";
import { storeSession } from "./storeSession";
import { updateSession } from "./updateSession";

export const RedisCommonActions = {
    getSessionKey,
    getASession,
    getAllSessions,
    deleteSession,
    storeSession,
    updateSession
}

