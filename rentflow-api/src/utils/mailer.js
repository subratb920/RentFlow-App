import nodemailer from "nodemailer";

import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const isConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transport = isConfigured
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
    : null;

/**
 * Sends an email over SMTP. Without SMTP settings, development
 * prints the email to the API log instead (links can be opened from
 * there); production refuses.
 */
export async function sendMail({ to, subject, text, html }) {
    if (!transport) {
        if (env.NODE_ENV === "production") {
            throw new HttpError(503, "Email is not available right now.");
        }

        console.log(`\n[mail] To: ${to}\n[mail] Subject: ${subject}\n${text}\n`);
        return;
    }

    await transport.sendMail({
        from: env.MAIL_FROM || env.SMTP_USER,
        to,
        subject,
        text,
        html,
    });
}
