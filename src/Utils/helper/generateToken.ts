import jwt from "jsonwebtoken"
import config from "@/Config";
import { StringValue } from "ms";

const accessToken = <T extends object>(data: T): string => {
    const token = jwt.sign({ ...data }, String(config.jwt.accessToken.secret), {
        expiresIn: config.jwt.accessToken.exp as StringValue
    })
    return token
}

const refreshToken = <T extends object>(data: T): string => {
    const token = jwt.sign({ ...data }, String(config.jwt.refreshToken.secret), {
        expiresIn: config.jwt.refreshToken.exp as StringValue
    })
    return token
}

const customToken = <T extends object>(payload: T, expTime: string = '5m') => {
    const token = jwt.sign(payload, String(config.jwt.accessToken.secret), {
        expiresIn: expTime as StringValue
    })
    return token
}


export const generateToken = {
    accessToken,
    refreshToken,
    customToken
}