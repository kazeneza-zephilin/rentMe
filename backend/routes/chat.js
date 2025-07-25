const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { createNotification } = require("./notifications");

const router = express.Router();
const prisma = new PrismaClient();

// Get all chats for a user
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        const chats = await prisma.chat.findMany({
            where: {
                OR: [{ renterId: userId }, { ownerId: userId }],
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: true,
                        category: true,
                        location: true,
                    },
                },
                renter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1, // Get the latest message for preview
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        sender: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        res.json({ chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Failed to fetch chats" });
    }
});

// Get specific chat with all messages
router.get("/:chatId", requireAuth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        console.log(`Fetching chat ${chatId} for user ${userId}`);

        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [{ renterId: userId }, { ownerId: userId }],
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        images: true,
                        category: true,
                        location: true,
                    },
                },
                renter: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        content: true,
                        sender: true,
                        userId: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!chat) {
            console.log(`Chat ${chatId} not found for user ${userId}`);

            // Let's debug: check if the chat exists at all
            const chatExists = await prisma.chat.findUnique({
                where: { id: chatId },
                select: { id: true, renterId: true, ownerId: true },
            });

            if (chatExists) {
                console.log(
                    `Chat exists but access denied. Chat: ${JSON.stringify(
                        chatExists
                    )}, User: ${userId}`
                );
            } else {
                console.log(`Chat ${chatId} does not exist in database`);
            }

            return res
                .status(404)
                .json({ error: "Chat not found or access denied" });
        }

        // Fetch user data for messages separately
        const userIds = [...new Set(chat.messages.map((msg) => msg.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });

        // Create a user lookup map
        const userMap = users.reduce((map, user) => {
            map[user.id] = user;
            return map;
        }, {});

        // Add user data to messages
        chat.messages = chat.messages.map((message) => ({
            ...message,
            user: userMap[message.userId] || null,
        }));

        res.json({ chat });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Create a new chat by sending the first message
router.post("/listing/:listingId", requireAuth, async (req, res) => {
    try {
        const { listingId } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res
                .status(400)
                .json({ error: "Message content is required" });
        }

        // Get the listing details
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Don't allow owner to message their own listing
        if (listing.ownerId === userId) {
            return res
                .status(400)
                .json({ error: "Cannot message your own listing" });
        }

        // Check if chat already exists
        let chat = await prisma.chat.findUnique({
            where: {
                listingId_renterId: {
                    listingId: listingId,
                    renterId: userId,
                },
            },
        });

        // Create chat if it doesn't exist
        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    listingId: listingId,
                    renterId: userId,
                    ownerId: listing.ownerId,
                },
            });
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                sender: "renter",
                userId: userId,
                chatId: chat.id,
            },
        });

        // Update chat timestamp
        await prisma.chat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() },
        });

        // Create notification for the owner
        try {
            await createNotification(
                listing.ownerId,
                "chat_message",
                `New message about "${listing.title}"`,
                `${content.substring(0, 100)}${
                    content.length > 100 ? "..." : ""
                }`,
                chat.id,
                JSON.stringify({
                    listingId: listing.id,
                    chatId: chat.id,
                })
            );
        } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
        }

        // Return the full chat with the new message
        const fullChat = await prisma.chat.findUnique({
            where: { id: chat.id },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        images: true,
                        category: true,
                        location: true,
                    },
                },
                renter: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        res.status(201).json({ chat: fullChat });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ error: "Failed to create chat" });
    }
});

// Send a message to an existing chat
router.post("/:chatId/messages", requireAuth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res
                .status(400)
                .json({ error: "Message content is required" });
        }

        // Get the chat and verify access
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                OR: [{ renterId: userId }, { ownerId: userId }],
            },
            include: {
                listing: {
                    select: {
                        title: true,
                    },
                },
                renter: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!chat) {
            return res
                .status(404)
                .json({ error: "Chat not found or access denied" });
        }

        // Determine sender
        const isOwner = chat.ownerId === userId;
        const sender = isOwner ? "owner" : "renter";

        // Create the message
        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                sender: sender,
                userId: userId,
                chatId: chat.id,
            },
        });

        // Update chat timestamp
        await prisma.chat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() },
        });

        // Create notification for the other party
        try {
            const recipientId = isOwner ? chat.renterId : chat.ownerId;
            const senderName = isOwner
                ? chat.owner.firstName
                : chat.renter.firstName;

            await createNotification(
                recipientId,
                "chat_message",
                `New message from ${senderName} about "${chat.listing.title}"`,
                `${content.substring(0, 100)}${
                    content.length > 100 ? "..." : ""
                }`,
                chat.id,
                JSON.stringify({
                    listingId: chat.listingId,
                    chatId: chat.id,
                })
            );
        } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
        }

        res.status(201).json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

module.exports = router;
