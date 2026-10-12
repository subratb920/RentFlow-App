import { HttpError } from "./httpError.js";

/**
 * Normalizes a phone number to digits with an optional leading "+"
 * (spaces, dashes and brackets removed). Returns "" for empty input.
 */
export function normalizePhone(value) {
    const raw = String(value ?? "").trim();

    if (!raw) {
        return "";
    }

    const digits = raw.replace(/\D/g, "");

    return raw.startsWith("+") ? `+${digits}` : digits;
}

/**
 * Normalizes and validates a phone number (10–15 digits).
 */
export function parsePhone(value, { field = "phone", required = true } = {}) {
    const phone = normalizePhone(value);

    if (!phone) {
        if (required) {
            throw new HttpError(400, "Phone number is required.", field);
        }

        return "";
    }

    const digitCount = phone.replace("+", "").length;

    if (digitCount < 10 || digitCount > 15) {
        throw new HttpError(400, "Enter a valid phone number.", field);
    }

    return phone;
}
