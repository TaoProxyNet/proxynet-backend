import {Schema} from "mongoose";
import {TMetadata} from "@/Utils/types/customSchema.type";

export const MetaDataSchema = new Schema<TMetadata>({
    title: {
        type: String,
    },
    description: {
        type: String,
    }
}, {
    _id: false,
    versionKey: false
})