import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const API_BASE = "https://api.razorpay.com/v1";

export function isRazorpayConfigured() {
    return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

async function razorpayRequest(path, options = {}) {
    if (!isRazorpayConfigured()) {
        throw new HttpError(503, "Online payments are not available yet.");
    }

    const credentials = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error("Razorpay error:", response.status, data);

        throw new HttpError(502, "Could not reach the payment service. Please try again.");
    }

    return data;
}

/**
 * Creates a Razorpay Payment Link; the tenant pays on Razorpay's
 * hosted page. Amount is in rupees.
 */
export async function createPaymentLink({ amount, description, referenceId, customer }) {
    return await razorpayRequest("/payment_links", {
        method: "POST",
        body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: "INR",
            description,
            reference_id: referenceId,
            customer,
            notify: { sms: false, email: false },
        }),
    });
}

export async function getPaymentLink(linkId) {
    return await razorpayRequest(`/payment_links/${encodeURIComponent(linkId)}`);
}
