import { AuthServices } from "@/App/modules/Auth/auth.services";
import { AuthValidation } from "@/App/modules/Auth/auth.validation";
import Config from "@/Config";
import CustomError from "@/Utils/errors/customError.class";
import catchAsync from "@/Utils/helper/catchAsync";
import { sendResponse } from "@/Utils/helper/sendResponse";
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ESessionType } from "./auth.types";

const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = AuthValidation.userCreateZodSchema.parse(req.body);
    console.log({ payload });
    const data = await AuthServices.createUser(payload);

    sendResponse.success(res, {
        statusCode: 200,
        message: "Registration successful. Please check your email for verification instructions.",
        data
    });
});

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = AuthValidation.userLoginZodSchema.parse(req.body);

    const data = await AuthServices.login(email, password);

    await AuthServices.afterLoginService({
        sessionId: data.sessionId,
        is2FaEnabled: data.is2FaEnabled,
        res
    })

    sendResponse.success(res, {
        statusCode: 200,
        message: data.is2FaEnabled ? "2FA enabled. Enter a code from your authenticator app to login." : "Login successful",
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = z.object({
        email: z.string().email()
    }).parse(req.body);

    const data = await AuthServices.forgetPassword(email);

    sendResponse.success(res, {
        statusCode: 200,
        message: "A instructions to reset your password has been sent to your email.",
        data
    });
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId, password } = AuthValidation.resetPasswordZodSchema.parse(req.body);

    await AuthServices.resetPassword({
        password,
        sessionId
    });
    sendResponse.success(res, {
        statusCode: 200,
        message: "Password reset successful",
    })
})

const resendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId, sessionType } = z.object({
        sessionId: z.string(),
        sessionType: z.nativeEnum(ESessionType),
    }).parse(req.body);
    const data = await AuthServices.resendOtp({
        sessionId,
        sessionType
    });
    sendResponse.success(res, {
        statusCode: 200,
        message: "Otp resent successfully",
        data
    })
})

const validateSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { otp, sessionType } = z.object({
        otp: z.string(),
        sessionType: z.nativeEnum(ESessionType),
    }).parse(req.body);
    let tempSessionId: string | null = null

    if (sessionType === ESessionType.LOGIN_2FA) {
        tempSessionId = req.cookies['2fa-session-id']
    } else {
        tempSessionId = req.body.sessionId
    }

    console.log("validateSession controller", { tempSessionId })

    const sessionId = z.string({
        required_error: "Session ID is required"
    }).parse(tempSessionId)


    const data = await AuthServices.validateSession({
        sessionId,
        otp,
        sessionType
    });
    if (data.validated && data.sessionId && data.nextAction === "login") {
        //delete 2fa session id from cookie
        res.clearCookie('2fa-session-id');
        //set auth session id in cookie
        res.cookie('auth-session-id', data.sessionId, {
            httpOnly: true,
            secure: Config.node_env === 'prod',
            maxAge: 24 * 60 * 60 * 1000, //1 day
            sameSite: 'strict',
            path: '/',
        })
    }

    sendResponse.success(res, {
        statusCode: 200,
        message: "Session validated successfully",
        data
    })
})

const generate2FaSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = AuthValidation.generate2FaSessionZodSchema.parse({
        _id: req.headers._id
    });
    console.log("generate2FaSession controller", { _id })

    const data = await AuthServices.generate2FaSession(_id);
    //set session id in cookie
    res.cookie('2faSessionId', data.sessionId, {
        httpOnly: true,
        secure: Config.node_env === 'prod',
        maxAge: 2 * 60 * 1000,
        sameSite: 'strict',
        path: '/',
    })
    const { qrCode, key } = data;

    sendResponse.success(res, {
        statusCode: 200,
        message: "2FA session generated successfully",
        data: {
            qrCode,
            key,
        }
    })
})

const enable2Fa = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { _id, otp, sessionId } = AuthValidation.enable2FaZodSchema.parse({
        _id: req.headers._id,
        otp: req.body.otp,
        sessionId: req.cookies['2faSessionId'] ?? "willow_bayer54@yahoo.com"
    });
    console.log("enable2Fa controller", { _id, otp, sessionId })

    const data = await AuthServices.enable2Fa(_id, otp, sessionId);
    //delete 2fa session id from cookie
    res.clearCookie('2faSessionId');

    sendResponse.success(res, {
        statusCode: 200,
        message: "2FA enabled successfully",
    })
})

const disable2Fa = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { _id, otp } = AuthValidation.disable2FaZodSchema.parse({
        _id: req.headers._id,
        otp: req.body.otp
    });
    const data = await AuthServices.disable2Fa(_id, otp);
    sendResponse.success(res, {
        statusCode: 200,
        message: "2FA disabled successfully",
    })
})

const socialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.user as {
        sessionId: string,
        is2FaEnabled: boolean,
        nextAction: string
    }
    console.log("socialLogin controller", data)
    if (!data) {
        throw new CustomError("Social login failed", 400)
    }
    await AuthServices.afterLoginService({
        sessionId: data.sessionId,
        is2FaEnabled: data.is2FaEnabled,
        res
    })
    res.redirect('https://trelyt.com')
    // sendResponse.success(res, {
    //     statusCode: 200,
    //     message: "Social login successful",
    // })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies['auth-session-id']
    if (!sessionId) {
        throw new CustomError("Already logged out.", 400)
    }
    await AuthServices.logoutService(sessionId)
    res.clearCookie('auth-session-id');
    res.redirect('https://trelyt.com')
})

export const AuthController = {
    register,
    login,
    forgetPassword,
    resetPassword,
    resendOtp,
    validateSession,
    generate2FaSession,
    enable2Fa,
    disable2Fa,
    socialLogin,
    logout
};
