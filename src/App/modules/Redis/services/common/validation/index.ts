import { allowedOtpSessionTypes, ESessionType } from "@/App/modules/Auth/auth.types"
import CustomError from "@/Utils/errors/customError.class"
import { RedisSessionValidation } from "../../../session.validation"

interface IProcessValidationPayload {
    sessionType: ESessionType,
    actionType: "create" | "update" | "delete" | "get" | "getAll" | "getByEmail" | "validate"
    data: Record<string, any>
}

const processValidation = <T extends IProcessValidationPayload>({ sessionType, actionType, data }: T) => {

    //otp session validation
    if (allowedOtpSessionTypes.includes(sessionType)) {
        switch (actionType) {
            case "create":
                return RedisSessionValidation.otp.createPayload.parse(data)
            case "update":
                return RedisSessionValidation.otp.updatePayload.parse(data)
            case "delete":
                return RedisSessionValidation.otp.deletePayload.parse(data)
            default:
                throw new CustomError('Invalid action type', 400);
        }
    }

    //login session validation
    if (sessionType === ESessionType.LOGIN) {
        switch (actionType) {
            case "create":
                return RedisSessionValidation.login.createPayload.parse(data)
            default:
                throw new CustomError('Invalid action type', 400);
        }
    }

    //login failed attempts session validation
    if (sessionType === ESessionType.LOGIN_FAILED_ATTEMPTS) {
        switch (actionType) {
            case "create":
                return RedisSessionValidation.login.failedAttemptsPayload.parse(data)
            default:
                throw new CustomError('Invalid action type', 400);
        }
    }

    throw new CustomError('Invalid request to process validation.', 400);
}

export const RedisCommonValidation = {
    processValidation
}