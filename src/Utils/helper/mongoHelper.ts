import {Types} from "mongoose";
import CustomError from "@/Utils/errors/customError.class";

type _TPayload = {
    [key: string]: string | Types.ObjectId
}
type TConvertObjectIdResponse = {
    [key: string]: Types.ObjectId
}
// const convertToObjectId = (data: _TPayload): TConvertObjectIdResponse => {
//     let modifyPayload: any = {}
//     Object.entries(data).map(([key, value]) => {
//         modifyPayload[key] = new Types.ObjectId(value)
//     })
//     return modifyPayload
// }

const convertToObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
    try {
        return new Types.ObjectId(id)
    } catch (e) {
        throw new CustomError('Invalid id. ', 400)
    }
}

export const MongoHelper = {
    convertToObjectId
}