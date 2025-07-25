import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increase timeout to 60 seconds for image uploads
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
                } else {
                    // Fallback to mock token for development (zephilin)
                    config.headers.Authorization = `Bearer mock-token-cmdhi4wuv00004092tyn8cb5f`;
                }
            } catch (error) {
                console.error("Error getting auth token:", error);
                // Fallback to mock token for development (zephilin)
                config.headers.Authorization = `Bearer mock-token-cmdhi4wuv00004092tyn8cb5f`;
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

// Helper function to create authenticated request config
export const createAuthenticatedRequest = async (getToken) => {
    try {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${
                    token || "mock-token-cmdhi4wuv00004092tyn8cb5f"
                }`,
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        console.error("Error creating authenticated request:", error);
        // Fallback to mock token for development (zephilin)
        return {
            headers: {
                Authorization: `Bearer mock-token-cmdhi4wuv00004092tyn8cb5f`,
                "Content-Type": "application/json",
            },
        };
    }
};

export { api };
