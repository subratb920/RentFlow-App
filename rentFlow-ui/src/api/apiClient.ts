import axios from "axios";

import { getToken } from "../services/storage/authStorage";

const apiClient = axios.create({
    baseURL: "http://192.168.0.104:46170/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

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

export default apiClient;