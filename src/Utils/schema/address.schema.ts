import {Schema} from "mongoose";
import {TAddress} from "@/Utils/types/customSchema.type";

export const AddressSchema = new Schema<TAddress>({
    streetAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
    },
    zipCode: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    }
}, {
    _id: false,
    versionKey: false
})