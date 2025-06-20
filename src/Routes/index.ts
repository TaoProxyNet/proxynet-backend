import { Router } from "express";
import AuthRoutes from "@/App/modules/Auth/auth.routes";

const rootRouter = Router()

rootRouter
    .use(
        '/auth',
        AuthRoutes
    )

export default rootRouter
