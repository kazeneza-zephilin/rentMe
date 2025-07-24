const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { body, query, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();
const prisma = new PrismaClient();

// Image upload endpoint
router.post(
    "/upload-images",
    requireAuth,
    (req, res, next) => {
        // Set a timeout for the upload request
        req.setTimeout(60000, () => {
            res.status(408).json({
                error: "Upload timeout. Please try again with smaller images.",
                code: "UPLOAD_TIMEOUT",
            });
        });
        next();
    },
    upload.array("images", 5),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No images uploaded" });
            }

            // Extract image URLs from uploaded files
            const imageUrls = req.files.map((file) => file.path);

            res.json({
                success: true,
                images: imageUrls,
                message: `${imageUrls.length} image(s) uploaded successfully`,
            });
        } catch (error) {
            console.error("Error uploading images:", error);

            // Check if this is a Cloudinary configuration error
            if (
                error.message.includes("Must supply cloud_name") ||
                error.message.includes("Must supply api_key") ||
                error.message.includes("Must supply api_secret")
            ) {
                return res.status(500).json({
                    error: "Image upload service not configured. Please add listings without images or contact support.",
                    code: "CLOUDINARY_NOT_CONFIGURED",
                });
            }

            // Check for timeout or network errors
            if (
                error.code === "ETIMEDOUT" ||
                error.message.includes("timeout")
            ) {
                return res.status(408).json({
                    error: "Upload timeout. Please try again with smaller images.",
                    code: "UPLOAD_TIMEOUT",
                });
            }

            res.status(500).json({
                error: "Failed to upload images. You can create the listing without images and add them later.",
                details: error.message,
            });
        }
    }
);

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

// Get current user's listings (protected route) - MOVED BEFORE /:id TO AVOID CONFLICT
router.get("/user/me", requireAuth, async (req, res) => {
    try {
        const userId = req.auth.userId; // This is now the database user ID
        console.log("Fetching listings for user:", userId);

        // Get user's listings directly using the database user ID
        const listings = await prisma.listing.findMany({
            where: {
                ownerId: userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        clerkId: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`Found ${listings.length} listings for user`);

        res.json({ listings });
    } catch (error) {
        console.error("Error fetching user listings:", error);
        res.status(500).json({
            error: "Failed to fetch user listings",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
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
                        clerkId: true,
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
            available = true,
        } = req.body;

        console.log("Received data:", {
            title,
            description,
            price,
            category,
            location,
            images,
            available,
        });
        console.log("Auth user:", req.auth.userId);

        // Detailed validation with specific error messages
        const errors = {};

        if (!title || !title.trim()) {
            errors.title = "Title is required";
        } else if (title.trim().length < 3) {
            errors.title = "Title must be at least 3 characters";
        }

        if (!description || !description.trim()) {
            errors.description = "Description is required";
        } else if (description.trim().length < 10) {
            errors.description = "Description must be at least 10 characters";
        }

        if (!price && price !== 0) {
            errors.price = "Price is required";
        } else if (isNaN(price) || parseFloat(price) <= 0) {
            errors.price = "Price must be a positive number";
        }

        if (!category || !category.trim()) {
            errors.category = "Category is required";
        }

        if (!location || !location.trim()) {
            errors.location = "Location is required";
        }

        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: "Validation failed",
                errors: Object.entries(errors).map(([field, message]) => ({
                    path: field,
                    msg: message,
                })),
            });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { id: req.auth.userId },
        });

        if (!user) {
            console.log("User not found for ID:", req.auth.userId);
            return res.status(401).json({ error: "User not found" });
        }

        console.log("Using user:", user.id);

        const listing = await prisma.listing.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                category: category.trim(),
                location: location.trim(),
                available: Boolean(available),
                images:
                    Array.isArray(images) && images.length > 0
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

        console.log("Created listing:", listing.id);

        res.status(201).json(listing);
    } catch (error) {
        console.error("Error creating listing:", error);

        // Handle different types of errors
        if (error.code === "P2002") {
            return res.status(400).json({
                error: "A listing with this title already exists",
            });
        }

        res.status(500).json({
            error: "Failed to create listing. Please try again.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

// Update listing (protected route)
router.put(
    "/:id",
    requireAuth,
    [
        body("title")
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage("Title must be between 3 and 200 characters"),
        body("description")
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage("Description must be between 10 and 2000 characters"),
        body("price")
            .isFloat({ min: 0.01 })
            .withMessage("Price must be a positive number"),
        body("category").notEmpty().withMessage("Category is required"),
        body("location")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Location must be between 2 and 100 characters"),
        body("available")
            .optional()
            .isBoolean()
            .withMessage("Available must be true or false"),
        body("images")
            .optional()
            .isArray({ min: 1 })
            .withMessage("At least one image is required"),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: "Validation failed",
                    errors: errors.array(),
                });
            }

            const listingId = req.params.id;
            const {
                title,
                description,
                price,
                category,
                location,
                images,
                available,
            } = req.body;
            const userId = req.auth.userId;

            console.log("Update request for listing:", listingId);
            console.log("User ID:", userId);
            console.log("Update data:", req.body);

            // Check if listing exists and user owns it
            const existingListing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: { owner: true },
            });

            if (!existingListing) {
                return res.status(404).json({
                    error: "Listing not found",
                });
            }

            // Check ownership
            if (existingListing.ownerId !== userId) {
                return res.status(403).json({
                    error: "You can only edit your own listings",
                });
            }

            // Update the listing
            const updatedListing = await prisma.listing.update({
                where: { id: listingId },
                data: {
                    title,
                    description,
                    price: parseFloat(price),
                    category,
                    location,
                    images: images || existingListing.images,
                    available:
                        available !== undefined
                            ? available
                            : existingListing.available,
                    updatedAt: new Date(),
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            clerkId: true,
                        },
                    },
                },
            });

            console.log("Updated listing:", updatedListing.id);

            res.json(updatedListing);
        } catch (error) {
            console.error("Error updating listing:", error);

            // Handle different types of errors
            if (error.code === "P2002") {
                return res.status(400).json({
                    error: "A listing with this title already exists",
                });
            }

            if (error.code === "P2025") {
                return res.status(404).json({
                    error: "Listing not found",
                });
            }

            res.status(500).json({
                error: "Failed to update listing. Please try again.",
                details:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
);

// Delete listing (protected route)
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.auth.userId;

        console.log("Delete request for listing:", listingId);
        console.log("User ID:", userId);

        // Check if listing exists and user owns it
        const existingListing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                ownerId: true,
            },
        });

        if (!existingListing) {
            return res.status(404).json({
                error: "Listing not found",
            });
        }

        // Check ownership
        if (existingListing.ownerId !== userId) {
            return res.status(403).json({
                error: "You can only delete your own listings",
            });
        }

        // Delete the listing
        await prisma.listing.delete({
            where: { id: listingId },
        });

        console.log("Deleted listing:", listingId);

        res.json({
            message: "Listing deleted successfully",
            id: listingId,
        });
    } catch (error) {
        console.error("Error deleting listing:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Listing not found",
            });
        }

        res.status(500).json({
            error: "Failed to delete listing. Please try again.",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

module.exports = router;
