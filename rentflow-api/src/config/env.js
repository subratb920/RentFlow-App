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

    // Optional: Razorpay payments are disabled without these
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",

    // Optional: Google sign-in is disabled without the web client ID
    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID ?? "",

    // API test suite only; ignored in production
    GOOGLE_TEST_TOKENS: process.env.GOOGLE_TEST_TOKENS === "true",

    // Email (SMTP). Without these, development prints emails to the log.
    SMTP_HOST: process.env.SMTP_HOST ?? "",
    SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
    SMTP_USER: process.env.SMTP_USER ?? "",
    SMTP_PASS: process.env.SMTP_PASS ?? "",
    MAIL_FROM: process.env.MAIL_FROM ?? "",

    // Base URL used in email links; must be reachable from the user's phone
    API_PUBLIC_URL: (
        process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT}`
    ).replace(/\/$/, ""),

    // Development only: lets sign-up skip email verification (dummy emails)
    ALLOW_UNVERIFIED_SIGNUP:
        process.env.ALLOW_UNVERIFIED_SIGNUP === "true" &&
        process.env.NODE_ENV !== "production",
};