import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Digits with an optional leading "+", e.g. +919876543210.
        // Optional in the schema because accounts created before
        // phone was collected do not have one.
        phone: {
            type: String,
            trim: true,
        },

        // Owners only: UPI ID tenants pay rent to
        upiId: {
            type: String,
            trim: true,
            default: "",
        },

        role: {
            type: String,
            enum: ["OWNER", "TENANT"],
            required: true,
            default: "OWNER",
        },

        // Not set for accounts that only sign in with Google
        password: {
            type: String,
            required() {
                return !this.googleId;
            },
        },

        // Google account id ("sub"), set when signed in with Google
        googleId: {
            type: String,
        },

        avatarUrl: {
            type: String,
            trim: true,
            default: "",
        },

        // false until the email link is clicked. Accounts created before
        // verification existed have no value and are treated as verified.
        emailVerified: {
            type: Boolean,
        },

        // SHA-256 of the emailed token; the token itself is never stored
        emailVerificationTokenHash: {
            type: String,
            index: true,
        },

        emailVerificationExpires: {
            type: Date,
        },

        emailVerificationSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// A phone number identifies at most one account; accounts without
// a phone are not indexed.
userSchema.index(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

userSchema.index(
    { googleId: 1 },
    { unique: true, partialFilterExpression: { googleId: { $type: "string" } } }
);

export const User = mongoose.model("User", userSchema);