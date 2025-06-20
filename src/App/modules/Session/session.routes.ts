import { Router } from "express";
import { SessionController } from "./session.controller";

const SessionRoutes = Router();

SessionRoutes
    .get(
        '/',
        SessionController.getAllSessions
    )
    .get(
        '/:id',
        SessionController.getASession
    )
    .patch(
        '/:id',
        SessionController.updateASession
    )
    .delete(
        '/:id',
        SessionController.deleteASession
    )
export default SessionRoutes;