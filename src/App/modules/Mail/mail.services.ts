import { MailUtils } from "@/Utils/mail/resend"
import { MailTemplates } from "./mail.templates"
import { EOtpType } from "./mail.types"

const forgetPassword = async ({ email, otp, resetUrl }: { email: string, otp: string, resetUrl: string }) => {

    const sendMail = await MailUtils.sendMail({
        from: "Trelyt<support@mail.trelyt.com>",
        to: email,
        subject: "Reset Password Request",
        replyTo: "noreply@trelyt.com",
        html: MailTemplates.otpTemplate({ code: otp, url: resetUrl, mailFor: EOtpType.FORGET_PASSWORD })
    })

    console.log({ sendMail })

}

const accountVerification = async ({ email, otp, verifyUrl }: { email: string, otp: string, verifyUrl: string }) => {

    const sendMail = await MailUtils.sendMail({
        from: "Trelyt<support@mail.trelyt.com>",
        to: email,
        subject: "Account Verification",
        replyTo: "noreply@trelyt.com",
        html: MailTemplates.otpTemplate({ code: otp, url: verifyUrl, mailFor: EOtpType.ACCOUNT_VERIFICATION })
    })

    console.log({ sendMail })

}

export const MailServices = {
    forgetPassword,
    accountVerification
}