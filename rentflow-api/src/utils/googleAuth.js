import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const client = new OAuth2Client();

// Test tokens ("test:" + base64url JSON payload) let the API test suite
// sign in without a real Google account. Off unless explicitly enabled,
// and never in production.
const allowTestTokens =
    env.GOOGLE_TEST_TOKENS && env.NODE_ENV !== "production";

export function isGoogleSignInEnabled() {
    return !!env.GOOGLE_WEB_CLIENT_ID || allowTestTokens;
}

/**
 * Verifies a Google ID token from the app and returns the profile
 * it vouches for. Only verified emails are accepted.
 */
export async function verifyGoogleIdToken(idToken) {
    if (!isGoogleSignInEnabled()) {
        throw new HttpError(503, "Google sign-in is not available yet.");
    }

    if (typeof idToken !== "string" || !idToken) {
        throw new HttpError(400, "Google sign-in failed. Please try again.");
    }

    const payload = await readPayload(idToken);

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new HttpError(401, "Your Google account email is not verified.");
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        fullName: payload.name ?? "",
        avatarUrl: payload.picture ?? "",
    };
}

async function readPayload(idToken) {
    if (allowTestTokens && idToken.startsWith("test:")) {
        try {
            return JSON.parse(Buffer.from(idToken.slice(5), "base64url").toString());
        } catch {
            throw new HttpError(401, "Google sign-in failed. Please try again.");
        }
    }

    // Without our client ID the token's audience cannot be checked
    if (!env.GOOGLE_WEB_CLIENT_ID) {
        throw new HttpError(503, "Google sign-in is not available yet.");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.GOOGLE_WEB_CLIENT_ID,
        });

        return ticket.getPayload();
    } catch {
        throw new HttpError(401, "Google sign-in failed. Please try again.");
    }
}
