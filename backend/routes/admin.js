const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const prisma = new PrismaClient();

// Admin credentials (in production, store these securely in environment variables)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@rentme.com";
// Use a static hash to avoid regenerating on each server restart
const ADMIN_PASSWORD_HASH =
    process.env.ADMIN_PASSWORD_HASH ||
    "$2b$10$bKmnaocvzjvDDGJsjXZmBOU7FiVG4H0UMOjkMIeRbktMZBQO2tRZe"; // admin123
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res
                .status(403)
                .json({ error: "Forbidden: Admin access required" });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

// Admin login endpoint
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 1 })
            .withMessage("Password is required"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Check admin credentials
            if (email !== ADMIN_EMAIL) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const isValidPassword = await bcrypt.compare(
                password,
                ADMIN_PASSWORD_HASH
            );
            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    email: ADMIN_EMAIL,
                    role: "admin",
                    iat: Math.floor(Date.now() / 1000),
                },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                success: true,
                token,
                admin: {
                    email: ADMIN_EMAIL,
                    role: "admin",
                },
            });
        } catch (error) {
            console.error("Admin login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Admin dashboard - Get overview statistics
router.get("/dashboard", requireAdminAuth, async (req, res) => {
    try {
        const [
            totalUsers,
            totalListings,
            totalBookings,
            totalRevenue,
            recentUsers,
            recentListings,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.listing.count(),
            prisma.booking.count().catch(() => 0), // Bookings might not exist yet
            prisma.booking
                .aggregate({
                    _sum: { totalAmount: true },
                })
                .then((result) => result._sum.totalAmount || 0)
                .catch(() => 0),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    createdAt: true,
                },
            }),
            prisma.listing.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    owner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);

        res.json({
            stats: {
                totalUsers,
                totalListings,
                totalBookings,
                totalRevenue,
            },
            recentUsers,
            recentListings,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});

// Get all users with pagination
router.get("/users", requireAdminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                  OR: [
                      { firstName: { contains: search, mode: "insensitive" } },
                      { lastName: { contains: search, mode: "insensitive" } },
                      { email: { contains: search, mode: "insensitive" } },
                  ],
              }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: {
                            listings: true,
                            bookings: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Admin users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Get all listings with pagination
router.get("/listings", requireAdminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;
        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(category && { category }),
        };

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    owner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
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
        console.error("Admin listings error:", error);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// Delete a user (admin only)
router.delete("/users/:userId", requireAdminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        // First delete all user's listings
        await prisma.listing.deleteMany({
            where: { ownerId: userId },
        });

        // Then delete the user
        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// Delete a listing (admin only)
router.delete("/listings/:listingId", requireAdminAuth, async (req, res) => {
    try {
        const { listingId } = req.params;

        await prisma.listing.delete({
            where: { id: listingId },
        });

        res.json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
        console.error("Admin delete listing error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Listing not found" });
        }
        res.status(500).json({ error: "Failed to delete listing" });
    }
});

// Toggle user active status
router.patch(
    "/users/:userId/toggle-status",
    requireAdminAuth,
    async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    // Add an active field to your user schema if needed
                    // For now, we'll just return success
                },
            });

            res.json({ success: true, user: updatedUser });
        } catch (error) {
            console.error("Admin toggle user status error:", error);
            res.status(500).json({ error: "Failed to update user status" });
        }
    }
);

// Verify admin token endpoint
router.get("/verify", requireAdminAuth, (req, res) => {
    res.json({
        success: true,
        admin: {
            email: req.admin.email,
            role: req.admin.role,
        },
    });
});

module.exports = router;
