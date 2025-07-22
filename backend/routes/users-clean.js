const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get("/profile", requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: req.auth.userId },
            include: {
                listings: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                bookings: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    include: {
                        listing: {
                            select: {
                                title: true,
                                images: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

// Update user profile
router.put(
    "/profile",
    requireAuth,
    [
        body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
        body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
        body("phone").optional().isMobilePhone(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { firstName, lastName, phone } = req.body;

            const updatedUser = await prisma.user.update({
                where: { clerkId: req.auth.userId },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                },
            });

            res.json(updatedUser);
        } catch (error) {
            console.error("Error updating user profile:", error);
            res.status(500).json({ error: "Failed to update user profile" });
        }
    }
);

// Get user by ID (public profile)
router.get("/:userId", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                createdAt: true,
                listings: {
                    where: { available: true },
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: true,
                        category: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        listing: {
                            select: {
                                title: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Calculate average rating
        const avgRating =
            user.reviews.length > 0
                ? user.reviews.reduce((sum, review) => sum + review.rating, 0) /
                  user.reviews.length
                : 0;

        res.json({
            ...user,
            avgRating: Math.round(avgRating * 10) / 10,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

module.exports = router;
