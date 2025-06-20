import AuthModel from "@/App/modules/Auth/auth.model";
import { allowedOtpSessionTypes, EAccountStatus, ESessionType, TAfterLoginServicePayload, TChangeAccountStatusPayload, TSocialLoginPayload, TUserCreatePayload } from "@/App/modules/Auth/auth.types";
import Config from "@/Config";
import { ENodeEnv } from "@/Config/utils/config.types";
import CustomError from "@/Utils/errors/customError.class";
import { HashHelper } from "@/Utils/helper/hashHelper";
import { MongoQueryHelper } from "@/Utils/helper/queryOptimize";
import { Types } from "mongoose";
import { MailServices } from "../Mail/mail.services";
import RedisServices from "../Redis/services";
import { AuthRedisServices } from "./auth.redisServices";
import { AuthUtils } from "./auth.utils";

const createUser = async (payload: TUserCreatePayload) => {
    const existingUser = await AuthModel.findOne({ email: payload.email });
    if (existingUser) {
        throw new CustomError('User already exists with this email', 400);
    }

    const hashedPassword = await HashHelper.generateHashPassword(payload.password);
    await AuthModel.create({
        ...payload,
        password: hashedPassword
    });

    const otp = AuthUtils.generateOTP()
    const sessionId = payload.email.toLowerCase().trim()
    const verifyUrl = `${Config.frontend.verify_page_url}?session=${sessionId}&otp=${otp}`

    await RedisServices.otp.createSession({
        sessionId,
        email: payload.email,
        otp,
        redirectUrl: verifyUrl,
        expiresInMin: 10,
        remainingAttempts: 5,
        blockStatus: "false",
        sessionType: ESessionType.ACCOUNT_VERIFICATION
    })
    Config.node_env === ENodeEnv.PROD ? MailServices.accountVerification({
        email: payload.email,
        otp,
        verifyUrl: verifyUrl
    }) : null
    return {
        sessionId
    }
};

const login = async (email: string, password: string) => {

    const query = MongoQueryHelper('String', 'email', email)
    const user = await AuthModel.findOne(query);
    if (!user) {
        throw new CustomError('User not found', 404);
    }
    //check if user is active
    if (user.accountStatus !== EAccountStatus.ACTIVE) {
        throw new CustomError(`Account is ${user.accountStatus}. Please contact support.`, 400);
    }

    const isPasswordMatch = await HashHelper.comparePassword(password, user.password);
    if (!isPasswordMatch) {
        // console.log("login data", { loginServices: RedisServices.login })
        await RedisServices.login.storeFailedLoginAttempts({
            _id: user._id as Types.ObjectId,
            email: user.email
        })
        throw new CustomError('Invalid credentials', 400);
    }
    //generate a session id
    const sessionId = AuthUtils.generateSessionId()
    //store session in redis
    const metadata = {
        email: user.email,
        role: user.role,
        _id: user._id as Types.ObjectId,
        createdAt: new Date()
    }

    //check if 2fa is enabled, we will store 2fa session id in redis
    if (user.is2FaEnabled && user.twoFactorSecret) {
        const sessionId = AuthUtils.generateSessionId()
        await RedisServices.twoFactorAuthentication.store2FaSession({
            sessionId,
            email: user.email,
            secret: user.twoFactorSecret,
            expiresInMin: 2,
            remainingAttempts: 5,
            sessionType: ESessionType.LOGIN_2FA,
            metadata
        })
        return {
            sessionId,
            is2FaEnabled: true
        }
    } else {
        // console.log("login data", { loginServices: RedisServices.login })
        await RedisServices.login.storeLoginSession({
            sessionId,
            ...metadata,
        })
        return {
            sessionId,
            is2FaEnabled: false
        }
    }
};

const findUserByEmail = async (email: string) => {
    const query = MongoQueryHelper('String', 'email', email)
    return await AuthModel.findOne(query);
};

const findUserById = async (id: string) => {
    return await AuthModel.findById(id);
};

const forgetPassword = async (email: string) => {
    const query = MongoQueryHelper('String', 'email', email)
    const user = await AuthModel.findOne(query);
    if (!user) {
        throw new CustomError('User not found', 404);
    }

    //create a  session id and otp
    const sessionId = email.toLowerCase().trim()
    const otp = AuthUtils.generateOTP()

    const resetUrl = `${Config.frontend.reset_page_url}?session=${sessionId}&otp=${otp}`

    await RedisServices.otp.createSession({
        sessionId,
        email,
        otp,
        redirectUrl: resetUrl,
        expiresInMin: 10,
        remainingAttempts: 5,
        blockStatus: "false",
        sessionType: ESessionType.FORGET_PASSWORD
    })

    Config.node_env === ENodeEnv.PROD ? MailServices.forgetPassword({
        email,
        otp,
        resetUrl: resetUrl
    }) : null
    return {
        sessionId
    }
}

const validateSession = async ({ otp, sessionId, sessionType }: { sessionId: string, otp: string, sessionType: ESessionType }) => {
    //validate session and create a reset password session and return it
    if (sessionType === ESessionType.FORGET_PASSWORD) {
        const sessionData = await RedisServices.otp.getASession({ sessionType, sessionId })
        console.log({ sessionData })
        if (!sessionData || sessionData.otp !== otp) {
            throw new CustomError('Invalid session', 404);
        }
        const resetPasswordSessionId = AuthUtils.generateSessionId()

        await RedisServices.resetPassword.createSession({
            sessionId: resetPasswordSessionId,
            email: sessionData.email,
            expiresInMin: 5,
        })
        //delete forget password session
        await RedisServices.otp.deleteSession({ sessionType, sessionId })
        return {
            validated: true,
            sessionId: resetPasswordSessionId,
            nextAction: "reset-password"
        }
    }
    if (sessionType === ESessionType.EMAIL_VERIFICATION || sessionType === ESessionType.ACCOUNT_VERIFICATION) {
        const sessionData = await AuthRedisServices.getSession(sessionType, sessionId)
        if (!sessionData || sessionData.otp !== otp) {
            throw new CustomError('Invalid session or Incorrect OTP.', 404);
        }
        await AuthModel.updateOne({ email: sessionData.email }, { isEmailVerified: true })
        await AuthRedisServices.deleteSession(sessionType, sessionId)
        return {
            validated: true,
        }
    }
    if (sessionType === ESessionType.LOGIN_2FA) {
        const sessionData = await RedisServices.twoFactorAuthentication.get2FaSession({ sessionType: ESessionType.LOGIN_2FA, sessionId })
        if (!sessionData) {
            throw new CustomError('Invalid session', 404);
        }
        //validate otp
        const isValid = await AuthUtils.verify2FaOTP(sessionData.secret, otp)
        if (!isValid) {
            throw new CustomError('Invalid OTP.', 400);
        }
        //store login data
        const metadata = {
            email: sessionData.email,
            role: sessionData.metadata?.role,
            _id: sessionData.metadata?._id,
            createdAt: new Date()
        }
        console.log("validateSession service", { metadata })

        await RedisServices.login.storeLoginSession({
            sessionId,
            ...metadata,
        })
        //remove 2fa session
        await RedisServices.twoFactorAuthentication.delete2FaSession({ sessionType: ESessionType.LOGIN_2FA, sessionId })
        return {
            validated: true,
            sessionId,
            nextAction: "login",
        }
    }
    throw new CustomError('Invalid session', 400);
}

const resetPassword = async ({ password, sessionId }: { sessionId: string, password: string }) => {
    //validate session and reset password
    const sessionData = await RedisServices.resetPassword.getSession(sessionId)
    console.log({ sessionData })
    if (!sessionData) {
        throw new CustomError('Invalid session', 404);
    }
    const email = sessionData
    const hashedPassword = await HashHelper.generateHashPassword(password);
    await AuthModel.updateOne({ email }, { password: hashedPassword })
    //delete reset password session
    await RedisServices.resetPassword.deleteSession(sessionId)
    return true
}

const resendOtp = async ({ sessionId, sessionType }: { sessionId: string, sessionType: ESessionType }) => {
    if (!allowedOtpSessionTypes.includes(sessionType)) {
        throw new CustomError('Invalid request', 400);
    }
    //resend otp
    const sessionData = await RedisServices.otp.getASession({ sessionType, sessionId })
    if (!sessionData) {
        throw new CustomError('Invalid session', 404);
    }
    const currentRemainingAttempts = sessionData.remainingAttempts as number
    if (currentRemainingAttempts <= 0) {
        throw new CustomError('Too many failed attempts. Please try again later.', 400);
    }
    const remainingAttempts = currentRemainingAttempts - 1
    const ttl = remainingAttempts === 0 ? 24 * 60 : 10

    const otp = AuthUtils.generateOTP()

    if (sessionType === ESessionType.EMAIL_VERIFICATION) {
        Config.node_env === ENodeEnv.PROD ? MailServices.forgetPassword({
            email: sessionData.email,
            otp,
            resetUrl: sessionData.redirectUrl ?? "",
        }) : null
    }

    if (sessionType === ESessionType.ACCOUNT_VERIFICATION) {
        Config.node_env === ENodeEnv.PROD ? MailServices.accountVerification({
            email: sessionData.email,
            otp,
            verifyUrl: sessionData.redirectUrl ?? "",
        }) : null
    }

    const payload = { sessionId, otp, remainingAttempts, expiresInMin: ttl, sessionType }
    console.log({ payload })
    await RedisServices.otp.updateSession(payload)

    return {
        sessionId
    }

}

const generate2FaSession = async (_id: string | Types.ObjectId) => {
    //find user and validate user
    const user = await AuthModel.findOne({ _id })
    if (!user) throw new CustomError('Invalid user', 404)
    if (user.is2FaEnabled) throw new CustomError('Two-factor authentication is already enabled', 400)

    //generate 2fa secret
    const secret = await AuthUtils.generate2FaSession(user.email, Config.app_name)
    //generate a session id
    const sessionId = user.email.toLowerCase().trim()

    await RedisServices.twoFactorAuthentication.store2FaSession({
        sessionId,
        email: user.email,
        secret: secret.key,
        expiresInMin: 10,
        remainingAttempts: 5,
        sessionType: ESessionType.TWO_FACTOR_AUTHENTICATION
    })
    return {
        qrCode: secret.qrCode,
        key: secret.key,
        sessionId
    }
}

const enable2Fa = async (_id: string | Types.ObjectId, otp: string, sessionId: string) => {
    //1. validate session
    const sessionData = await RedisServices.twoFactorAuthentication.get2FaSession({ sessionType: ESessionType.TWO_FACTOR_AUTHENTICATION, sessionId })
    if (!sessionData) throw new CustomError('Invalid session.', 400)
    console.log({ sessionData })
    //validate otp
    const isValid = await AuthUtils.verify2FaOTP(sessionData.secret, otp)
    if (!isValid) throw new CustomError('Invalid OTP.', 400)

    //update user and delete session
    await AuthModel.updateOne({ _id }, { is2FaEnabled: true, twoFactorSecret: sessionData.secret })
    await RedisServices.twoFactorAuthentication.delete2FaSession({ sessionType: ESessionType.TWO_FACTOR_AUTHENTICATION, sessionId })

    return true
}

const disable2Fa = async (_id: string | Types.ObjectId, otp: string) => {
    //1. validate user and check if 2fa is enabled and two factor secret is not empty
    const user = await AuthModel.findOne({ _id })
    if (!user) throw new CustomError('Invalid user', 404)
    if (!user.is2FaEnabled || !user.twoFactorSecret) throw new CustomError('Two-factor authentication is not enabled', 400)

    //2. validate otp
    const isValid = await AuthUtils.verify2FaOTP(user.twoFactorSecret, otp)
    if (!isValid) throw new CustomError('Invalid OTP.', 400)

    //3. update user , false 2fa and empty two factor secret
    await AuthModel.updateOne({ _id }, { is2FaEnabled: false, twoFactorSecret: "" })
    return true
}

const changeAccountStatus = async (payload: TChangeAccountStatusPayload) => {
    //1. validate user
    const user = await AuthModel.findOne({ _id: payload._id })
    if (!user) throw new CustomError('Invalid user', 404)
    //2. validate status
    if (user.accountStatus === payload.status) throw new CustomError(`Account status is already ${payload.status}`, 400)
    //3. update user
    await AuthModel.updateOne({ _id: payload._id }, { accountStatus: payload.status, statusNote: payload.statusNote ?? "" })
    return true
}

/* 
    //check if user exists
    //if not create user, then process to login
    //if user check 2fa enabled or not
    //if 2fa enabled, then process 2fa login flow
    //if 2fa not enabled, then process login flow
    //return session id

*/
const socialLogin = async (payload: TSocialLoginPayload) => {
    try {

        const user = await AuthModel.findOne({ email: payload.email })
        if (!user) {
            //create user
            const createPayload = {
                ...payload,
                isSocialLogin: true,
                socialLoginProvider: payload.socialLoginProvider,
                password: crypto.randomUUID()
            }
            const newUser = await AuthModel.create(createPayload)
            //process to login  
            const sessionId = AuthUtils.generateSessionId()
            await RedisServices.login.storeLoginSession({
                sessionId,
                _id: newUser._id as Types.ObjectId,
                email: newUser.email,
                role: newUser.role,
                createdAt: new Date()
            })
            return {
                sessionId,
                is2FaEnabled: false,
                nextAction: "login"
            }
        }
        //check if 2fa is enabled, we will store 2fa session id in redis
        const sessionId = AuthUtils.generateSessionId()
        const metadata = {
            email: user.email,
            role: user.role,
            _id: user._id as Types.ObjectId,
            createdAt: new Date()
        }

        if (user.is2FaEnabled && user.twoFactorSecret) {
            await RedisServices.twoFactorAuthentication.store2FaSession({
                sessionId,
                email: user.email,
                secret: user.twoFactorSecret,
                expiresInMin: 2,
                remainingAttempts: 5,
                sessionType: ESessionType.LOGIN_2FA,
                metadata
            })
            return {
                sessionId,
                is2FaEnabled: true,
                nextAction: "login-2fa"
            }
        } else {
            const data = await RedisServices.login.storeLoginSession({
                sessionId,
                ...metadata,
            })
            console.log("social login data", { data })
            return {
                sessionId,
                is2FaEnabled: false,
                nextAction: "login"
            }
        }
    } catch (error) {
        console.log("social login service error", { error })
        throw new CustomError('Something went wrong', 500);
    }
}

const logoutService = async (sessionId: string) => {
    await RedisServices.login.deleteSession({ sessionType: ESessionType.LOGIN, sessionId })
    return true
}


const afterLoginService = async ({ sessionId, is2FaEnabled, res }: TAfterLoginServicePayload) => {
    if (is2FaEnabled && sessionId) {
        res.cookie('2fa-session-id', sessionId, {
            httpOnly: true,
            secure: Config.node_env === 'prod',
            maxAge: 2 * 60 * 1000,
            sameSite: 'strict',
            path: '/',
        })
    }

    if (sessionId && !is2FaEnabled) {
        res.cookie('auth-session-id', sessionId, {
            httpOnly: true,
            secure: Config.node_env === 'prod',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/',
            // domain: Config.cookie_domain,
            // expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
    }
}

export const AuthServices = {
    createUser,
    login,
    findUserByEmail,
    findUserById,
    forgetPassword,
    validateSession,
    resetPassword,
    resendOtp,
    generate2FaSession,
    enable2Fa,
    disable2Fa,
    changeAccountStatus,
    socialLogin,
    afterLoginService,
    logoutService
};
