import { TwoFactorAuthenticationServices } from "./2fa.services";
import { RedisDBIndexServices } from "./dbIndex.services";
import { LoginSessionServices } from "./login.services";
import { RedisOtherServices } from "./others.services";
import { OtpSessionServices } from "./otp.services";

const RedisServices = {
    otp: OtpSessionServices,
    dbIndex: RedisDBIndexServices,
    login: LoginSessionServices,
    resetPassword: {
        createSession: RedisOtherServices.storeResetPasswordSession,
        getSession: RedisOtherServices.getResetPasswordSession,
        deleteSession: RedisOtherServices.deleteResetPasswordSession
    },
    twoFactorAuthentication: TwoFactorAuthenticationServices,
}

export default RedisServices;