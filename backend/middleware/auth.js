// Development middleware for mock tokens and basic JWT handling
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requireAuth = async (req, res, next) => {
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
            // If specific user ID provided, use it; otherwise use zephilin for development
            const userId = extractedUserId || "cmdhi4wuv00004092tyn8cb5f"; // zephilin's ID

            req.auth = {
                userId: userId,
            };
            req.userId = userId; // For backward compatibility
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

                const clerkUserId = payload.sub || payload.user_id;

                // Look up the database user ID from the Clerk ID
                try {
                    const user = await prisma.user.findUnique({
                        where: { clerkId: clerkUserId },
                        select: { id: true },
                    });

                    if (user) {
                        req.auth = {
                            userId: user.id,
                        };
                        req.userId = user.id;
                        console.log("Real token auth set:", req.auth);
                        return next();
                    } else {
                        console.log(
                            "User not found in database for Clerk ID:",
                            clerkUserId,
                            "- attempting to create user"
                        );

                        // Try to create the user automatically
                        try {
                            const newUser = await prisma.user.create({
                                data: {
                                    clerkId: clerkUserId,
                                    email:
                                        payload.email ||
                                        `user-${clerkUserId}@clerk.local`,
                                    firstName:
                                        payload.given_name ||
                                        payload.first_name ||
                                        "User",
                                    lastName:
                                        payload.family_name ||
                                        payload.last_name ||
                                        "",
                                },
                            });

                            req.auth = {
                                userId: newUser.id,
                            };
                            req.userId = newUser.id;
                            console.log("Auto-created user:", req.auth);
                            return next();
                        } catch (createError) {
                            console.error(
                                "Failed to auto-create user:",
                                createError
                            );
                            // Fall back to zephilin user for development
                            req.auth = {
                                userId: "cmdhi4wuv00004092tyn8cb5f",
                            };
                            req.userId = req.auth.userId;
                            console.log(
                                "Fallback auth set for missing user:",
                                req.auth
                            );
                            return next();
                        }
                    }
                } catch (dbError) {
                    console.error("Database lookup error:", dbError);
                    // Use fallback user for development instead of returning error
                    req.auth = {
                        userId: "cmdhg17wp0000ev8bac2ktfwd",
                    };
                    req.userId = req.auth.userId;
                    console.log("Fallback auth set due to DB error:", req.auth);
                    return next();
                }
            }
        } catch (parseError) {
            console.log(
                "Token parsing failed, treating as opaque token:",
                parseError.message
            );
        }

        // Fallback for any other token format
        req.auth = {
            userId: "cmdhi4wuv00004092tyn8cb5f", // zephilin's ID
        };
        req.userId = req.auth.userId; // For backward compatibility
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
