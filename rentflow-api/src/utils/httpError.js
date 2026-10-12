/**
 * Error carrying an HTTP status (and optionally the form field it
 * relates to, or a code the app can act on) so controllers can
 * return a meaningful response.
 */
export class HttpError extends Error {
    constructor(status, message, field, code) {
        super(message);
        this.status = status;
        this.field = field;
        this.code = code;
    }
}

/**
 * Sends an HttpError as-is; logs anything else and returns a 500
 * with the supplied fallback message.
 */
export function sendError(res, error, fallbackMessage) {
    if (error instanceof HttpError) {
        return res.status(error.status).json({
            message: error.message,
            ...(error.field && { field: error.field }),
            ...(error.code && { code: error.code }),
        });
    }

    console.error(fallbackMessage, error);

    return res.status(500).json({ message: fallbackMessage });
}

/**
 * Parses a whole number within [min, max]; throws a 400 otherwise.
 */
export function parseWholeNumber(value, { field, label, min = 0, max }) {
    const number = Number(value);

    if (
        value === "" ||
        value === null ||
        value === undefined ||
        !Number.isInteger(number) ||
        number < min ||
        (max !== undefined && number > max)
    ) {
        const range = max !== undefined
            ? `between ${min} and ${max}`
            : `${min} or more`;

        throw new HttpError(
            400,
            `${label} must be a whole number ${range}.`,
            field
        );
    }

    return number;
}
