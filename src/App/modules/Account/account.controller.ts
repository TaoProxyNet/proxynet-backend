import catchAsync from "@/Utils/helper/catchAsync";
import { AccountServices } from "./account.services";
import { queryOptimization } from "@/Utils/helper/queryOptimize";
import { accountFilterFields, accountSortFields } from "./account.types";
import { IAuth } from "../Auth/auth.types";
import { sendResponse } from "@/Utils/helper/sendResponse";
import { z } from "zod";
import { AccountValidation } from "./account.validations";

const getAllAccounts = catchAsync(async (req, res) => {
    const payload = queryOptimization<IAuth>(req, accountFilterFields as (keyof IAuth)[])
    const result = await AccountServices.getAllAccounts(payload)
    sendResponse.success(res, {
        statusCode: 200,
        message: "Accounts fetched successfully",
        data: result
    })
})

const getAccount = catchAsync(async (req, res) => {

    const id = z.string().parse(req.params.id)

    const result = await AccountServices.getAccount(id)

    sendResponse.success(res, {
        statusCode: 200,
        message: "Account fetched successfully",
        data: result
    })
})

const updateAccountInformation = catchAsync(async (req, res) => {
    const id = z.string().parse(req.params.id)
    const payload = AccountValidation.accountUpdateSchema.parse(req.body)
    const result = await AccountServices.updateAccountInformation(id, payload)
    sendResponse.success(res, {
        statusCode: 200,
        message: "Account information updated successfully",
        data: result
    })
})

const deleteAccount = catchAsync(async (req, res) => {
    const id = z.string().parse(req.params.id)
    await AccountServices.deleteAccount(id)
    sendResponse.success(res, {
        statusCode: 200,
        message: "Account deleted successfully",
    })
})

export const AccountController = {
    getAllAccounts,
    getAccount,
    updateAccountInformation,
    deleteAccount
}