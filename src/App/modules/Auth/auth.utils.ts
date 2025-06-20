import { CodeGeneratorUtils } from "@/Utils/helper/CodeGenerator";
import { ECodeGeneratorCharset } from "@/Utils/helper/CodeGenerator/types";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { AuthRedisServices } from "./auth.redisServices";
import { ESessionType, TRedisStoreFailedAttemptsPayload } from "./auth.types";
import { AuthValidation } from "./auth.validation";

const generateOTP = (length: number = 6) => {
    const otp = CodeGeneratorUtils.generateOne({
        pattern: `#`.repeat(length),
        charset: ECodeGeneratorCharset.ALPHANUMERIC,
    })
    return otp.toUpperCase()
}

const generateSessionId = (length: number = 32) => {
    return CodeGeneratorUtils.generateOne({
        pattern: `#`.repeat(length),
        charset: ECodeGeneratorCharset.ALPHANUMERIC,
    })
}

const storeFailedAttempts = async ({
    sessionType,
    email,
}: {
    sessionType: ESessionType,
    email: string,
}) => {

    const currentData = await AuthRedisServices.getFailedAttempts(sessionType, email)

    let attemptNumber = currentData?.attemptsCount ? parseInt(currentData.attemptsCount) + 1 : 1
    let expiresInMin = 10  //10 min
    let payload: TRedisStoreFailedAttemptsPayload = {
        sessionType,
        email,
        attemptsCount: attemptNumber,
        attemptsRemaining: 5 - attemptNumber,
        attemptsResetTime: "",
        blockStatus: "false",
        blockReason: "",
        blockTime: "",
        expiresInMin
    }

    if (attemptNumber === 5) {
        payload.expiresInMin = 12 * 60  //12h
        payload.blockStatus = "true"
        payload.blockReason = 'Max attempts reached. please try again after 12 hours.'
        payload.blockTime = new Date().toISOString()
        payload.attemptsResetTime = new Date(Date.now() + payload.expiresInMin * 60 * 1000).toISOString()
    }

    const validatePayload = AuthValidation.redisStoreFailedAttemptsZodSchema.parse(payload)
    console.log({ validatePayload });

    const data = await AuthRedisServices.storeFailedAttempts(validatePayload)
    return data;
}

const generate2FaSession = async (email: string, applicationName: string) => {
    const secret = authenticator.generateSecret();

    const issuer = `${applicationName}`
    const user = email

    const otpauth = authenticator.keyuri(
        // encodeURIComponent(user),
        // encodeURIComponent(issuer),
        user,
        issuer,
        secret
    );

    const img = await qrcode.toDataURL(otpauth);

    return {
        qrCode: img,
        key: secret
    }
}

const verify2FaOTP = async (secret: string, code: string) => {
    return authenticator.verify({
        secret,
        token: code,
    })
}

export const AuthUtils = {
    generateOTP,
    generateSessionId,
    storeFailedAttempts,
    generate2FaSession,
    verify2FaOTP
}