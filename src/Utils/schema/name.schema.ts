import {Schema} from "mongoose";
import {TName} from "@/Utils/types/customSchema.type";

export const NameSchema = new Schema<TName>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
}, {
    _id: false,
    versionKey: false
})