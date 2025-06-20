import { Router } from "express";
import { AccountController } from "./account.controller";

const AccountRoutes = Router()

AccountRoutes
    .get('/', AccountController.getAllAccounts)
    .get('/user/:id', AccountController.getAccount)
    .put('/user/:id', AccountController.updateAccountInformation)
    .delete('/user/:id', AccountController.deleteAccount)

export default AccountRoutes