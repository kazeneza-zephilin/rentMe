const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get user's notifications
router.get("/", requireAuth, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit to 50 most recent notifications
        });

        res.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Get unread notification count
router.get("/unread-count", requireAuth, async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId: req.userId,
                read: false,
            },
        });

        res.json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: "Failed to fetch unread count" });
    }
});

// Mark notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.userId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        res.json({ notification: updatedNotification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
});

// Mark all notifications as read
router.patch("/mark-all-read", requireAuth, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.userId,
                read: false,
            },
            data: { read: true },
        });

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            error: "Failed to mark all notifications as read",
        });
    }
});

// Helper function to create a notification
const createNotification = async (
    userId,
    type,
    title,
    message,
    relatedId = null
) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                relatedId,
            },
        });
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

module.exports = { router, createNotification };
