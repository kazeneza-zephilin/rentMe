// Development middleware for mock tokens and basic JWT handling
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Auth header received:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    // Extract token
    const token = authHeader.substring(7);
    console.log("Received token:", token.substring(0, 30) + "...");

    try {
        // Check if it's a mock token for development
        if (token.startsWith("mock-token-")) {
            console.log("Using mock token for development");
            const extractedUserId = token.replace("mock-token-", "");
            const userId = extractedUserId
                ? `clerk_${extractedUserId}`
                : "clerk_user_1";

            req.auth = {
                userId: userId,
            };
            console.log("Mock auth set:", req.auth);
            return next();
        }

        // For real Clerk tokens, we'll extract the user ID from the token payload
        // In production, use proper JWT verification with Clerk's secret
        try {
            // Simple base64 decode to get payload (NOT SECURE - for development only)
            const parts = token.split(".");
            if (parts.length === 3) {
                const payload = JSON.parse(
                    Buffer.from(parts[1], "base64").toString()
                );
                console.log("Token payload:", payload);

                req.auth = {
                    userId:
                        payload.sub || payload.user_id || "clerk_default_user",
                };
                console.log("Real token auth set:", req.auth);
                return next();
            }
        } catch (parseError) {
            console.log(
                "Token parsing failed, treating as opaque token:",
                parseError.message
            );
        }

        // Fallback for any other token format
        req.auth = {
            userId: "clerk_authenticated_user",
        };
        console.log("Fallback auth set:", req.auth);
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = {
    requireAuth,
};
