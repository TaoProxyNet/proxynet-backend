/* 
    express application root file
*/

import config from "@/Config";
import globalErrorHandler from "@/Middlewares/Errors/globalErrorHandler";
import notFoundHandler from "@/Middlewares/Errors/notFoundHandler";
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from "cookie-parser";
import cors from 'cors';
import express, { Application } from 'express';
import configRoutes from "./Routes/config";

const app: Application = express()
app.enable('trust proxy')
app.use(express.json({ limit: '10mb' }))
app.use(cors())
app.use(cookieParser())

app.use('/', configRoutes)
app.use(globalErrorHandler)
app.use(notFoundHandler)


const {
    api_key, cloud_name, api_secret
} = config

cloudinary.config({
    cloud_name,
    api_key,
    api_secret
});

// MailService.test()
// MailService.sendInvoice('65d6187e8b10be34fc3d53fc')
// console.log('path =>', path.join(process.cwd(), "templates/invoice"))

const main = async () => {
    // setTimeout(async () => {
    //     const data = await LoginSessionServices.getSessionByEmail({
    //         sessionType: ESessionType.LOGIN,
    //         email: 'rahman.sharif39n@gmail.com'
    //     })
    //     console.log({ data })
    // }, 50000);

}
main()

export default app
