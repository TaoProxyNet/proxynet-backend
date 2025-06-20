import { ESessionType } from "@/App/modules/Auth/auth.types";

export const getSessionKey = (sessionType: ESessionType, sessionId: string) => {
    return `${sessionType}:${sessionId}`;
}