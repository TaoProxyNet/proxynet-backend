import {Response} from "express";
import {TCustomErrorResponse, TGenericSuccessMessages} from "@/Utils/types/response.type";
import {pickFunction} from "@/Utils/helper/pickFunction";

const successResponse = <T, M>(res: Response, data: TGenericSuccessMessages<T, M>) => {
    const property = pickFunction<any, any>(data, ["message", "data", "statusCode", "meta"])

    res.status(data.statusCode).json({
        success: true,
        ...property
        // message: data.message || null,
        // data: data.data,
        // meta: data?.meta || null
    })
}

const errorResponse = (res: Response, data: TCustomErrorResponse) => {
    const property = pickFunction(data, ["errorMessages", "message", "statusCode", "stack"])
    res.status(data.statusCode).json({
        success: false,
        ...property
        // message: data.message,
        // errorMessages: data.errorMessages,
        // stack: data.stack,
        // statusCode: data.statusCode
    })
}

export const sendResponse = {
    success: successResponse,
    error: errorResponse
}