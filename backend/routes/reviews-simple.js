const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get reviews for a listing
router.get("/listing/:listingId", async (req, res) => {
    try {
        res.json({ message: "Reviews endpoint working", reviews: [] });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Reviews routes working" });
});

module.exports = router;
