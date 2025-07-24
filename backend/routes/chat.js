const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { createNotification } = require("./notifications");

const router = express.Router();
const prisma = new PrismaClient();

// Get chat for a booking
router.get("/:bookingId", requireAuth, async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Check if user has access to this booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { listing: true },
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Only booking user or listing owner can access chat
        if (
            booking.userId !== req.userId &&
            booking.listing.ownerId !== req.userId
        ) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Get or create chat
        let chat = await prisma.chat.findUnique({
            where: { bookingId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
                booking: {
                    include: {
                        listing: {
                            include: {
                                owner: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        if (!chat) {
            chat = await prisma.chat.create({
                data: { bookingId },
                include: {
                    messages: true,
                    booking: {
                        include: {
                            listing: {
                                include: {
                                    owner: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        res.json({ chat });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Send a message
router.post("/:bookingId/messages", requireAuth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { content } = req.body;

        // Check booking access
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { listing: true },
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (
            booking.userId !== req.userId &&
            booking.listing.ownerId !== req.userId
        ) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Get or create chat
        let chat = await prisma.chat.findUnique({
            where: { bookingId },
        });

        if (!chat) {
            chat = await prisma.chat.create({
                data: { bookingId },
            });
        }

        // Determine sender
        const sender =
            booking.listing.ownerId === req.userId ? "owner" : "user";

        // Create message
        const message = await prisma.message.create({
            data: {
                content,
                sender,
                userId: req.userId,
                chatId: chat.id,
            },
        });

        // Create notification for the other party
        try {
            const recipientId =
                sender === "owner" ? booking.userId : booking.listing.ownerId;
            const senderName =
                sender === "owner" ? "Listing Owner" : "Booking User";

            await createNotification(
                recipientId,
                "chat_message",
                `New message from ${senderName}`,
                `${content.substring(0, 100)}${
                    content.length > 100 ? "..." : ""
                }`,
                booking.id
            );
        } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Don't fail the message send if notification fails
        }

        res.status(201).json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

module.exports = router;
