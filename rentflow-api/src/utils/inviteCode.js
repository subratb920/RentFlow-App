import { randomInt } from "node:crypto";

// No 0/O, 1/I/L so codes are easy to read out
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Returns a code such as "RF-7K2Q9M".
 */
export function generateInviteCode() {
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += ALPHABET[randomInt(ALPHABET.length)];
    }

    return `RF-${code}`;
}

/**
 * Normalizes user input ("rf 7k2q9m" -> "RF-7K2Q9M").
 */
export function normalizeInviteCode(value) {
    const cleaned = String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const body = cleaned.startsWith("RF") ? cleaned.slice(2) : cleaned;

    return `RF-${body}`;
}
