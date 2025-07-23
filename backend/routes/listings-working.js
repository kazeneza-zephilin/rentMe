const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult, param } = require("express-validator");
const auth = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/listings - Fetch all listings
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const category = req.query.category;
        const search = req.query.search;
        const available = req.query.available !== "false";

        const skip = (page - 1) * limit;

        const where = { available: available };

        if (category && category !== "all") {
            where.category = {
                contains: category,
                mode: "insensitive",
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }

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
                skip,
                take: limit,
            }),
            prisma.listing.count({ where }),
        ]);

        res.json({
            listings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// GET /api/listings/:id - Get single listing
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        email: true,
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
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

// POST /api/listings - Create new listing (protected)
router.post("/", auth, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            location,
            available = true,
            images = [],
        } = req.body;
        const userId = req.user.id;

        // Basic validation
        if (!title || !description || !price || !category || !location) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                category,
                location,
                images,
                available: available === "true" || available === true,
                ownerId: userId,
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

        res.status(201).json({
            message: "Listing created successfully",
            listing,
        });
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({ error: "Failed to create listing" });
    }
});

// PUT /api/listings/:id - Update listing (protected)
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            price,
            category,
            location,
            available,
            images,
        } = req.body;
        const userId = req.user.id;

        const existingListing = await prisma.listing.findUnique({
            where: { id },
        });

        if (!existingListing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        if (existingListing.ownerId !== userId) {
            return res
                .status(403)
                .json({ error: "Not authorized to update this listing" });
        }

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: {
                title,
                description,
                price: parseFloat(price),
                category,
                location,
                images,
                available: available === "true" || available === true,
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

        res.json({
            message: "Listing updated successfully",
            listing: updatedListing,
        });
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ error: "Failed to update listing" });
    }
});

// DELETE /api/listings/:id - Delete listing (protected)
router.delete("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const listing = await prisma.listing.findUnique({ where: { id } });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        if (listing.ownerId !== userId) {
            return res
                .status(403)
                .json({ error: "Not authorized to delete this listing" });
        }

        await prisma.listing.delete({ where: { id } });

        res.json({ message: "Listing deleted successfully" });
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json({ error: "Failed to delete listing" });
    }
});

// GET /api/listings/user/:userId - Get user's listings
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where: { ownerId: userId },
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
                skip,
                take: limit,
            }),
            prisma.listing.count({ where: { ownerId: userId } }),
        ]);

        res.json({
            listings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching user listings:", error);
        res.status(500).json({ error: "Failed to fetch user listings" });
    }
});

module.exports = router;
