import crypto from "crypto";

import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { sendMail } from "../utils/mailer.js";

const LINK_VALID_HOURS = 24;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a fresh single-use link and emails it. Only the token's
 * hash is stored, so a database leak can't be used to verify.
 */
export async function sendVerificationEmail(user) {
    const token = crypto.randomBytes(32).toString("base64url");

    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpires = new Date(
        Date.now() + LINK_VALID_HOURS * 60 * 60 * 1000
    );
    user.emailVerificationSentAt = new Date();
    await user.save();

    const link = `${env.API_PUBLIC_URL}/api/auth/verify-email?token=${token}`;

    await sendMail({
        to: user.email,
        subject: "Verify your RentFlow email",
        text:
            `Hi ${user.fullName},\n\n` +
            `Tap the link below to verify your email and start using RentFlow:\n${link}\n\n` +
            `The link expires in ${LINK_VALID_HOURS} hours. ` +
            `If you didn't create a RentFlow account, ignore this email.`,
        html: `
            <p>Hi ${escapeHtml(user.fullName)},</p>
            <p>Tap the button below to verify your email and start using RentFlow.</p>
            <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a></p>
            <p style="color:#6B7280;font-size:13px">The link expires in ${LINK_VALID_HOURS} hours.
            If you didn't create a RentFlow account, ignore this email.</p>`,
    });
}

/**
 * Marks the email verified if the token matches an unexpired link.
 * Returns "verified", "already" (link reused after success) or "invalid".
 */
export async function verifyEmailToken(token) {
    if (typeof token !== "string" || token.length < 20) {
        return "invalid";
    }

    const user = await User.findOne({
        emailVerificationTokenHash: hashToken(token),
    });

    if (!user) {
        return "invalid";
    }

    if (user.emailVerified) {
        return "already";
    }

    if (user.emailVerificationExpires < new Date()) {
        return "invalid";
    }

    // The hash is kept so opening the link again says "already verified"
    user.emailVerified = true;
    user.emailVerificationExpires = undefined;
    await user.save();

    return "verified";
}

/**
 * Sends a new link to an unverified account. Always succeeds from the
 * caller's point of view, so it can't be used to discover accounts.
 */
export async function resendVerification(email) {
    const user = await User.findOne({
        email: String(email ?? "").trim().toLowerCase(),
    });

    if (!user || user.emailVerified !== false) {
        return;
    }

    const recentlySent =
        user.emailVerificationSentAt &&
        Date.now() - user.emailVerificationSentAt.getTime() < RESEND_COOLDOWN_MS;

    if (recentlySent) {
        return;
    }

    await sendVerificationEmail(user);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[char]);
}
