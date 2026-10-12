import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    createUser,
    findUserByEmail,
    findUserById,
} from "../repositories/user.repository.js";

import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { parsePhone } from "../utils/phone.js";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";
import { sendVerificationEmail } from "./emailVerification.service.js";
import { User } from "../models/User.js";

// Signup tokens use their own secret so they can never pass as a session
const SIGNUP_SECRET = `${env.JWT_SECRET}:google-signup`;
const MAX_NAME_LENGTH = 100;

const ROLES = ["OWNER", "TENANT"];

const ROLE_LABELS = {
    OWNER: "Property Owner",
    TENANT: "Tenant",
};

function assertValidRole(role) {
    if (!ROLES.includes(role)) {
        throw new HttpError(400, "Select Property Owner or Tenant.", "role");
    }
}

export async function registerUser(data) {
    const { fullName, password, role } = data;
    const email = normalizeEmail(data.email);

    if (!fullName || !email || !password || !role) {
        throw new HttpError(400, "All fields are required.");
    }

    assertValidRole(role);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpError(400, "Enter a valid email address.", "email");
    }

    // Dummy emails for development; the API refuses this otherwise
    const skipVerification = data.skipEmailVerification === true;

    if (skipVerification && !env.ALLOW_UNVERIFIED_SIGNUP) {
        throw new HttpError(400, "Email verification can't be skipped.");
    }

    const phone = parsePhone(data.phone);

    if (await User.exists({ phone })) {
        throw new HttpError(409, "This phone number is already registered.", "phone");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new HttpError(409, "Email already exists.", "email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
        fullName,
        email,
        phone,
        role,
        password: hashedPassword,
        emailVerified: skipVerification,
    });

    if (skipVerification) {
        return {
            message: "Registration successful. Please login.",
            verificationRequired: false,
        };
    }

    // The account exists even if sending fails; the user can resend
    try {
        await sendVerificationEmail(user);
    } catch (error) {
        console.error("Could not send verification email:", error);
    }

    return {
        message: `We sent a verification link to ${email}. Open it, then log in.`,
        verificationRequired: true,
    };
}

// ---------------- LOGIN ----------------

export async function loginUser(data) {
    const { password, role } = data;
    const email = normalizeEmail(data.email);

    if (!email || !password) {
        throw new HttpError(400, "Email and password are required.");
    }

    assertValidRole(role);

    const user = await findUserByEmail(email);

    if (!user) {
        throw new HttpError(401, "Invalid email or password.");
    }

    if (!user.password) {
        throw new HttpError(
            400,
            "This account uses Google sign-in. Tap Continue with Google."
        );
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new HttpError(401, "Invalid email or password.");
    }

    // Checked only after the password, so a failed login never
    // reveals which role (or whether) an email is registered.
    assertRoleMatches(user, role);

    if (user.emailVerified === false) {
        throw new HttpError(
            403,
            `Verify your email first. We sent a link to ${user.email}.`,
            undefined,
            "EMAIL_NOT_VERIFIED"
        );
    }

    return issueSession(user);
}

// ---------------- GOOGLE ----------------

/**
 * Signs in with a Google ID token. Existing accounts (matched by
 * Google id, or by verified email) sign straight in; new users get a
 * short-lived signup token to finish their profile with a phone number.
 */
export async function googleLogin(data) {
    assertValidRole(data.role);

    const profile = await verifyGoogleIdToken(data.idToken);

    const user =
        (await User.findOne({ googleId: profile.googleId })) ??
        (await findUserByEmail(profile.email));

    if (user) {
        assertRoleMatches(user, data.role);

        // Link a password account the first time it uses Google;
        // Google has verified the email, so it counts as verified
        if (!user.googleId || user.emailVerified === false) {
            user.googleId ||= profile.googleId;
            user.avatarUrl ||= profile.avatarUrl;
            user.emailVerified = true;
            await user.save();
        }

        return issueSession(user);
    }

    const signupToken = jwt.sign(
        { ...profile, role: data.role },
        SIGNUP_SECRET,
        { expiresIn: "15m" }
    );

    return {
        needsProfile: true,
        signupToken,
        profile: {
            fullName: profile.fullName,
            email: profile.email,
        },
    };
}

/**
 * Creates the account for a new Google user once they add a phone number.
 */
export async function completeGoogleSignup(data) {
    let profile;

    try {
        profile = jwt.verify(String(data.signupToken ?? ""), SIGNUP_SECRET);
    } catch {
        throw new HttpError(401, "Sign-in expired. Please continue with Google again.");
    }

    const fullName = String(data.fullName ?? "").trim();

    if (!fullName || fullName.length > MAX_NAME_LENGTH) {
        throw new HttpError(400, "Enter your full name.", "fullName");
    }

    const phone = parsePhone(data.phone);

    if (await User.exists({ phone })) {
        throw new HttpError(409, "This phone number is already registered.", "phone");
    }

    const taken = await User.exists({
        $or: [{ googleId: profile.googleId }, { email: profile.email }],
    });

    if (taken) {
        throw new HttpError(409, "This account already exists. Please sign in.");
    }

    const user = await createUser({
        fullName,
        email: profile.email,
        phone,
        role: profile.role,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        emailVerified: true,
    });

    return issueSession(user);
}

// ---------------- Helpers ----------------

function normalizeEmail(value) {
    return String(value ?? "").trim().toLowerCase();
}

function assertRoleMatches(user, role) {
    if (user.role !== role) {
        throw new HttpError(
            403,
            `This account is registered as a ${ROLE_LABELS[user.role]}. Please use ${ROLE_LABELS[user.role]} login.`,
            "role"
        );
    }
}

function issueSession(user) {
    const token = jwt.sign(
        {
            id: user._id,
        },
        env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return {
        token,
        user: toUserResponse(user),
    };
}

function toUserResponse(user) {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        avatarUrl: user.avatarUrl ?? "",
    };
}

export async function getCurrentUser(userId) {
    const user = await findUserById(userId);

    if (!user) {
        throw new HttpError(404, "User not found.");
    }

    return toUserResponse(user);
}