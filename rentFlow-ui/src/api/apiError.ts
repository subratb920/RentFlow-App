import axios from "axios";

export interface ApiError {
    message: string;

    // Form field the API rejected, when it reports one
    field?: string;

    // Machine-readable reason, e.g. EMAIL_NOT_VERIFIED
    code?: string;
}

/**
 * Extracts the API's error message (and field, if any) so screens
 * can show the real reason a request failed.
 */
export function getApiError(
    error: unknown,
    fallbackMessage: string
): ApiError {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as Partial<ApiError> | undefined;

        if (data?.message) {
            return { message: data.message, field: data.field, code: data.code };
        }

        if (!error.response) {
            return {
                message: "Cannot reach the server. Check your connection and try again.",
            };
        }
    }

    return { message: fallbackMessage };
}
