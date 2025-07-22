import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Custom hook to get API client with auth
export const useApi = () => {
    const { getToken } = useAuth();

    // Set up request interceptor to add auth token
    api.interceptors.request.use(
        async (config) => {
            try {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Error getting auth token:", error);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return api;
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.error || error.message || "An error occurred";
        console.error("API Error:", message);
        return Promise.reject({ ...error, message });
    }
);

export default api;
