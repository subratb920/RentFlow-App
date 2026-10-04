import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    PORT: Number(requireEnv("PORT")),
    NODE_ENV: requireEnv("NODE_ENV"),
    MONGO_URI: requireEnv("MONGO_URI"),
    DB_NAME: requireEnv("DB_NAME"),
    JWT_SECRET: requireEnv("JWT_SECRET"),
};