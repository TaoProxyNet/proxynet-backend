import { MailContent } from "./mail.content"
import { TOtpTemplatePayload } from "./mail.types"

// const forgetPasswordTemplate = ({ code, url }: {
//     code: string, url: string
// }) => {
//     return `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <meta charset="UTF-8">
//             <title>Password Reset Code</title>
//         </head>
//         <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//             <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center;">
//                 <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
//                 <p style="margin-bottom: 20px;">You have requested to reset your password. Please use the following code to complete the process:</p>
//                 <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px dashed #ddd;">
//                     <h1 style="color: #3498db; margin: 0; letter-spacing: 5px;">${code}</h1>
//                 </div>
//                 <p style="margin-bottom: 20px;">Or you can continue by clicking this button:</p>
//                 <div style="margin: 20px 0;">
//                     <a href="${url}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Continue Reset Password</a>
//                 </div>
//                 <p style="margin-bottom: 20px;">This code will expire in 10 minutes. If you didn't request this change, please ignore this email.</p>
//                 <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply to this email.</p>
//             </div>
//         </body>
//         </html>
//     `
// }




const otpTemplate = ({ code, mailFor, url }: TOtpTemplatePayload) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">${MailContent.otpMailContent[mailFor].emailHeader}</h2>
            <p style="margin-bottom: 20px;">${MailContent.otpMailContent[mailFor].instruction}</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px dashed #ddd;">
                <h1 style="color: #3498db; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p style="margin-bottom: 20px;">Or you can continue by clicking this button:</p>
            <div style="margin: 20px 0;">
                <a href="${url}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">${MailContent.otpMailContent[mailFor].buttonText}</a>
            </div>
            <p style="margin-bottom: 20px;">This code will expire in ${MailContent.otpMailContent[mailFor].expireTime}}. ${MailContent.otpMailContent[mailFor].warning}</p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">This is an automated message, please do not reply to this email.</p>
        </div>
    </body>
    </html>
`
}

export const MailTemplates = {
    // forgetPasswordTemplate
    otpTemplate
}