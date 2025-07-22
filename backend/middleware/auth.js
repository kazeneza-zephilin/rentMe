// Simple auth middleware - in production you'd verify Clerk tokens properly
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    // Extract token and decode (simplified for development)
    const token = authHeader.substring(7);

    try {
        // In production, verify the Clerk JWT token here
        // For now, we'll just mock the user ID
        req.auth = {
            userId: "clerk_user_1", // This should come from the verified token
        };
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = {
    requireAuth,
};
