const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Test authentication endpoint
router.get("/test-auth", requireAuth, async (req, res) => {
    try {
        console.log("Auth test - User ID:", req.userId);
        console.log("Auth test - Auth object:", req.auth);

        res.json({
            success: true,
            userId: req.userId,
            auth: req.auth,
            message: "Authentication successful",
        });
    } catch (error) {
        console.error("Auth test error:", error);
        res.status(500).json({ error: "Auth test failed" });
    }
});

module.exports = router;
