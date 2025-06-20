import catchAsync from "@/Utils/helper/catchAsync";
import { sendResponse } from "@/Utils/helper/sendResponse";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ESessionType } from "../Auth/auth.types";
import { RedisCommonActions } from "../Redis/services/common/actions";

const getASession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { id, sessionType } = z.object({
        id: z.string(),
        sessionType: z.nativeEnum(ESessionType)
    }).parse({
        id: req.params.id,
        sessionType: req.query.sessionType as ESessionType,
    });

    const data = await RedisCommonActions.getASession({
        sessionType: sessionType,
        sessionId: id,
    });

    sendResponse.success(res, {
        message: "Session fetched successfully",
        data,
        statusCode: 200,
    });

});

const getAllSessions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const payload = z.object({
        sessionType: z.nativeEnum(ESessionType),
        params: z.object({
            email: z.string().optional(),
            sessionId: z.string().optional(),
            page: z.number().optional(),
            limit: z.number().optional(),
        })
    }).parse({
        sessionType: req.query.sessionType,
        params: {
            email: req.query.email,
            sessionId: req.query.sessionId,
            page: req.query.page,
            limit: req.query.limit,
        }
    });

    const data = await RedisCommonActions.getAllSessions({
        sessionType: payload.sessionType,
        params: payload.params,
    });

    sendResponse.success(res, {
        message: "Sessions fetched successfully",
        data,
        statusCode: 200,
    });
});

const updateASession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const payload = z.object({
        sessionType: z.nativeEnum(ESessionType),
        sessionId: z.string(),
        data: z.record(z.any()),
        expiresInMin: z.number().optional(),
    }).parse({
        sessionType: req.query.sessionType,
        sessionId: req.params.id,
        data: req.body as Record<string, any>,
        expiresInMin: req.query.expiresInMin,
    });

    const data = await RedisCommonActions.updateSession(payload);

    sendResponse.success(res, {
        message: "Session updated successfully",
        data,
        statusCode: 200,
    });
});

const deleteASession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const payload = z.object({
        sessionType: z.nativeEnum(ESessionType),
        sessionId: z.string(),
    }).parse({
        sessionType: req.query.sessionType,
        sessionId: req.params.id,
    });

    const data = await RedisCommonActions.deleteSession(payload);

    sendResponse.success(res, {
        message: "Session deleted successfully",
        data,
        statusCode: 200,
    });
});

export const SessionController = {
    getASession,
    getAllSessions,
    updateASession,
    deleteASession,
};