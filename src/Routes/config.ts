import debuggerMiddleware from "@/Middlewares/Debug";
import { Router } from 'express';
import rootRouter from '.';

const configRoutes = Router()

configRoutes
    .use(
        '/api/v1',
        // debuggerMiddleware,
        rootRouter
    )
// .get('/test', (req: Request, res) => {
//     res.status(200).json({
//         message: 'Welcome to the API'
//     })
// })

export default configRoutes