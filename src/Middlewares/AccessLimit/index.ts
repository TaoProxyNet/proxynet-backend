import {NextFunction, Request, Response} from "express";
import catchAsync from "@/Utils/helper/catchAsync";
import {z} from "zod";
import jwt from "jsonwebtoken";
import Config from "@/Config";
import {CustomJwtPayload} from "@/Utils/types/jwtHelper.type";
import CustomError from "@/Utils/errors/customError.class";

const AccessLimit = (accessRole: string[]) => catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = z.string({
        required_error: "Access token is required."
    }).parse(req.headers.authorization?.split(' ')[1])
    const payload = jwt.verify(accessToken, Config.jwt.refreshToken.secret as string)
    const {uid, role, email} = payload as CustomJwtPayload

    if (accessRole.includes(role)) {

        req.body.uid = uid
        req.body.role = role
        req.body.email = email

        next()
    } else {
        throw new CustomError('Access permission denied. ', 401)
    }
})

export default AccessLimit