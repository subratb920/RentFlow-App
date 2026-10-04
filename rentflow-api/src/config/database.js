import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
    try {
        await mongoose.connect(env.MONGO_URI, {
            dbName: env.DB_NAME,
            authSource: "admin",
        });

        console.log("==================================");
        console.log("✅ MongoDB Connected");
        console.log(`📦 Database : ${env.DB_NAME}`);
        console.log(`🗄️  Host : ${env.MONGO_URI}`);
        console.log("==================================");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed");
        console.error(err);

        process.exit(1);
    }
}