import { Resend, CreateEmailOptions } from 'resend';
import CustomError from '../errors/customError.class';
import Config from '@/Config';

const resend = new Resend(Config.mail.resend_api_key);


const sendMail = async (payload: CreateEmailOptions) => {
    const { data, error } = await resend.emails.send(payload)

    if (data) {
        return data
    }
    if (error) {
        throw new CustomError(error.message, 500)
    }
}

export const MailUtils = {
    sendMail
}