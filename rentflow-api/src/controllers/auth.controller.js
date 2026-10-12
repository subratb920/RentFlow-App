import {
    registerUser,
    loginUser,
    getCurrentUser,
    googleLogin,
    completeGoogleSignup,
} from "../services/auth.service.js";
import {
    resendVerification,
    verifyEmailToken,
} from "../services/emailVerification.service.js";
import { sendError } from "../utils/httpError.js";

export async function register(req, res) {
    try {
        const result = await registerUser(req.body);

        res.status(201).json(result);
    } catch (err) {
        sendError(res, err, "Registration failed.");
    }
}

export async function login(req, res) {
    try {
        const result = await loginUser(req.body);

        res.status(200).json(result);
    } catch (err) {
        sendError(res, err, "Login failed.");
    }
}

export async function google(req, res) {
    try {
        const result = await googleLogin(req.body);

        res.status(200).json(result);
    } catch (err) {
        sendError(res, err, "Google sign-in failed.");
    }
}

export async function googleComplete(req, res) {
    try {
        const result = await completeGoogleSignup(req.body);

        res.status(201).json(result);
    } catch (err) {
        sendError(res, err, "Could not create your account.");
    }
}

/**
 * GET /api/auth/verify-email?token=...
 * Opened from the email, so it answers with a small web page
 */
export async function verifyEmail(req, res) {
    const PAGES = {
        verified: ["Email verified", "You're all set. Go back to the RentFlow app and log in."],
        already: ["Already verified", "This email is already verified. Go back to the RentFlow app and log in."],
        invalid: ["Link expired or invalid", "Open the RentFlow app, try to log in, and tap Resend to get a new link."],
    };

    try {
        const result = await verifyEmailToken(req.query.token);
        const [title, body] = PAGES[result];

        res.status(result === "invalid" ? 400 : 200).type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RentFlow · ${title}</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;background:#F3F4F6;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
.card{background:#fff;border-radius:16px;padding:32px 28px;max-width:420px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:22px;color:#111827;margin:0 0 12px}p{color:#4B5563;line-height:1.5;margin:0}.brand{font-weight:800;color:#2563EB;margin-bottom:20px}</style>
</head><body><div class="card"><div class="brand">RentFlow</div><h1>${title}</h1><p>${body}</p></div></body></html>`);
    } catch (err) {
        console.error("Email verification failed:", err);
        res.status(500).type("text").send("Something went wrong. Please try again.");
    }
}

/**
 * POST /api/auth/resend-verification { email }
 */
export async function resendVerificationEmail(req, res) {
    try {
        await resendVerification(req.body.email);

        res.status(200).json({
            message: "If that account needs verifying, a new link is on its way.",
        });
    } catch (err) {
        sendError(res, err, "Could not send the email.");
    }
}

export async function me(req, res) {
    try {
        const user = await getCurrentUser(req.user.id);

        res.status(200).json(user);
    } catch (err) {
        sendError(res, err, "Failed to fetch user.");
    }
}
