import config from "@/Config";
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (config.mongo_uri !== undefined) {
            const uri = config.mongo_uri
            await mongoose.connect(uri)
            console.log("Database connection established.")
        } else {
            console.log('retrying to establish connection')
            connectDB();
        }
    } catch (e) {
        console.log(" from config ====>", e instanceof Error && e.message)
    }
}

export default connectDB