import { api, createAuthenticatedRequest } from "./api";

export const notificationsApi = {
    // Get user's notifications
    getNotifications: async (getToken) => {
        const authConfig = await createAuthenticatedRequest(getToken);
        return api.get("/notifications", authConfig);
    },

    // Get unread notification count
    getUnreadCount: async (getToken) => {
        const authConfig = await createAuthenticatedRequest(getToken);
        return api.get("/notifications/unread-count", authConfig);
    },

    // Mark notification as read
    markAsRead: async (notificationId, getToken) => {
        const authConfig = await createAuthenticatedRequest(getToken);
        return api.patch(
            `/notifications/${notificationId}/read`,
            {},
            authConfig
        );
    },

    // Mark all notifications as read
    markAllAsRead: async (getToken) => {
        const authConfig = await createAuthenticatedRequest(getToken);
        return api.patch("/notifications/mark-all-read", {}, authConfig);
    },
};
