const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get user's bookings
router.get("/", requireAuth, async (req, res) => {
    try {
        res.json({ message: "Bookings endpoint working", bookings: [] });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Bookings routes working" });
});

module.exports = router;
