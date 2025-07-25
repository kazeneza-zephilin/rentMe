import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Bell, Check, MessageCircle, Calendar, Star } from "lucide-react";
import { notificationsApi } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const NotificationBell = () => {
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch notifications and unread count
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const [notificationsResponse, unreadResponse] = await Promise.all([
                notificationsApi.getNotifications(getToken),
                notificationsApi.getUnreadCount(getToken),
            ]);

            setNotifications(notificationsResponse.data.notifications || []);
            setUnreadCount(unreadResponse.data.count || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            // Set empty state on error to prevent UI issues
            setNotifications([]);
            setUnreadCount(0);

            // Don't throw error to prevent component crash
            if (error.response?.status === 401) {
                console.log(
                    "Authentication issue with notifications - using fallback"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await notificationsApi.markAsRead(notificationId, getToken);
            // Update local state
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead(getToken);
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case "chat_message":
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case "booking_status":
                return <Calendar className="h-4 w-4 text-green-500" />;
            case "review":
                return <Star className="h-4 w-4 text-yellow-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    // Format notification time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    // Fetch notifications on component mount and periodically
    useEffect(() => {
        fetchNotifications();

        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {loading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        No notifications yet
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start space-x-3 p-3 cursor-pointer ${
                                    !notification.read ? "bg-blue-50" : ""
                                }`}
                                onClick={() => {
                                    if (!notification.read) {
                                        markAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p
                                            className={`text-sm font-medium ${
                                                !notification.read
                                                    ? "text-gray-900"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 10 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
