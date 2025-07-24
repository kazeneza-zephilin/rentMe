const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Simple webhook endpoint for Clerk user events
router.post(
    "/webhooks/clerk",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        try {
            const body = JSON.parse(req.body.toString());
            const { type, data } = body;

            console.log("Clerk webhook received:", type);

            switch (type) {
                case "user.created":
                    await handleUserCreated(data);
                    break;
                case "user.updated":
                    await handleUserUpdated(data);
                    break;
                case "user.deleted":
                    await handleUserDeleted(data);
                    break;
                default:
                    console.log("Unhandled webhook type:", type);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            console.error("Webhook error:", error);
            res.status(500).json({ error: "Webhook processing failed" });
        }
    }
);

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Auth routes working" });
});

module.exports = router;

async function handleUserCreated(userData) {
    try {
        await prisma.user.create({
            data: {
                clerkId: userData.id,
                email: userData.email_addresses?.[0]?.email_address,
                firstName: userData.first_name,
                lastName: userData.last_name,
                avatar: userData.profile_image_url,
            },
        });
        console.log(`User created: ${userData.id}`);
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

async function handleUserUpdated(userData) {
    try {
        await prisma.user.update({
            where: { clerkId: userData.id },
            data: {
                email: userData.email_addresses?.[0]?.email_address,
                firstName: userData.first_name,
                lastName: userData.last_name,
                avatar: userData.profile_image_url,
            },
        });
        console.log(`User updated: ${userData.id}`);
    } catch (error) {
        console.error("Error updating user:", error);
    }
}

async function handleUserDeleted(userData) {
    try {
        await prisma.user.delete({
            where: { clerkId: userData.id },
        });
        console.log(`User deleted: ${userData.id}`);
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

module.exports = router;
