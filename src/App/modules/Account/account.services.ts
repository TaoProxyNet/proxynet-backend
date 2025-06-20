import CustomError from "@/Utils/errors/customError.class"
import { HashHelper } from "@/Utils/helper/hashHelper"
import { calculatePagination, manageSorting, MongoQueryHelper } from "@/Utils/helper/queryOptimize"
import { IQueryItems } from "@/Utils/types/query.type"
import AuthModel from "../Auth/auth.model"
import { IAuth } from "../Auth/auth.types"
import { accountSearchFields, TAccountUpdatePayload } from "./account.types"

const getAccount = async (accountId: string) => {
    const account = await AuthModel.findById(accountId).select('-password -twoFactorSecret')
    return account
}

const getAllAccounts = async (payload: IQueryItems<IAuth>) => {
    const { search } = payload.searchFields;
    const { page, skip, limit } = calculatePagination(payload.paginationFields)
    const { sortOrder, sortBy } = manageSorting(payload.sortFields)
    const filterFields = payload.filterFields;

    const queryConditions = []

    //search condition
    if (search) {
        queryConditions.push({
            $or: accountSearchFields.map(async (field) => {
                const fieldType = AuthModel.schema.path(field).instance
                return MongoQueryHelper(fieldType, field, search)
            })
        })
    }
    //filter condition
    if (Object.entries(filterFields).length > 0) {
        let tempConditions: {}[] = [];
        Object.entries(filterFields).map(([key, value]) => {
            if (Object.keys(AuthModel.schema.obj).includes(key)) {
                const fieldType = AuthModel.schema.path(key).instance
                tempConditions.push(MongoQueryHelper(fieldType, key, value as string))
            }
        })
        tempConditions.length && queryConditions.push({
            $and: tempConditions.map((condition) => condition)
        })
    }
    const query = queryConditions.length ? { $and: queryConditions } : {}

    const result = await AuthModel.find(query)
        .select("-password -twoFactorSecret")
        .sort({
            [sortBy]: sortOrder
        })
        .skip(skip)
        .limit(limit);

    const total = await AuthModel.countDocuments();

    return {
        meta: {
            page,
            limit,
            total,
            result: result.length,
        },
        data: result,
    }
}

const updateAccountInformation = async (accountId: string, payload: TAccountUpdatePayload) => {
    const account = await AuthModel.findById(accountId).lean()
    if (!account) {
        throw new CustomError("Account not found", 404)
    }
    let updatedData: Partial<IAuth> = {}

    Object.entries(payload).forEach(async ([key, value]) => {

        if (key === 'password') {
            updatedData.password = await HashHelper.generateHashPassword(value as string)
        }
        if (key === 'is2FaEnabled') {
            if (account.is2FaEnabled === value) return;
            //only account owner can enable 2FA, admin can disable 2FA only.
            if (value === true) {
                throw new CustomError('Only account owner can enable 2FA', 403)
            } else {
                updatedData.is2FaEnabled = value as boolean //set 2FA to false
                updatedData.twoFactorSecret = "" //remove 2FA secret
            }
        }
    })
    const updatedAccount = await AuthModel.findByIdAndUpdate(accountId, updatedData, { new: true })
    return updatedAccount
}

const deleteAccount = async (accountId: string) => {
    const account = await AuthModel.findById(accountId).lean()
    if (!account) {
        throw new CustomError("Account not found", 404)
    }
    await AuthModel.findByIdAndDelete(accountId)
}

export const AccountServices = {
    getAccount,
    getAllAccounts,
    updateAccountInformation,
    deleteAccount
}