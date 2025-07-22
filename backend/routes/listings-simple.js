const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, query, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all listings (public route)
router.get("/", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search,
            category,
            minPrice,
            maxPrice,
            location,
        } = req.query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where = {
            available: true,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(category && { category }),
            ...(location && {
                location: { contains: location, mode: "insensitive" },
            }),
            ...(minPrice || maxPrice
                ? {
                      price: {
                          ...(minPrice && { gte: parseFloat(minPrice) }),
                          ...(maxPrice && { lte: parseFloat(maxPrice) }),
                      },
                  }
                : {}),
        };

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: parseInt(skip),
                take: parseInt(limit),
            }),
            prisma.listing.count({ where }),
        ]);

        res.json({
            listings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// Get single listing by ID (public route)
router.get("/:id", async (req, res) => {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id: req.params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        res.json(listing);
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).json({ error: "Failed to fetch listing" });
    }
});

// Create new listing (protected route)
router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            location,
            images = [],
        } = req.body;

        // Basic validation
        if (!title || !description || !price || !category || !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // For now, just create a mock user if none exists
        let user = await prisma.user.findUnique({
            where: { clerkId: req.auth.userId },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: req.auth.userId,
                    email: "user@example.com",
                    firstName: "User",
                    lastName: "User",
                },
            });
        }

        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                category,
                location,
                images:
                    images.length > 0
                        ? images
                        : ["https://via.placeholder.com/400x300"],
                ownerId: user.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json(listing);
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({ error: "Failed to create listing" });
    }
});

module.exports = router;
