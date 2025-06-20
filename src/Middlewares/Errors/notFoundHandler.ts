import { sendResponse } from "@/Utils/helper/sendResponse";
import { Request, Response } from "express";

const notFoundHandler = async (req: Request, res: Response) => {

    sendResponse.error(res, {
        statusCode: 404,
        message: `path - ${req.originalUrl} not found`,
        errorMessages: [{
            path: req.originalUrl,
            message: 'path not found'
        }]
    })
}

export default notFoundHandler