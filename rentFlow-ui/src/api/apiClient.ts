import axios from "axios";

import { getToken } from "../services/storage/authStorage";

const apiClient = axios.create({
    baseURL: "http://192.168.0.106:46170/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registers the callback run when an authenticated request is
 * rejected with 401 (expired or invalid token).
 */
export function setUnauthorizedHandler(
    handler: (() => void) | null
) {
    unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // A 401 without a token (e.g. wrong password on login) is not
        // a session expiry, so only react when a token was sent.
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            error.config?.headers?.Authorization
        ) {
            unauthorizedHandler?.();
        }

        return Promise.reject(error);
    }
);

export default apiClient;
