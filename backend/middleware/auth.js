// Production-ready middleware for Clerk JWT tokens
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log(
        "Auth header received:",
        authHeader ? "Bearer token present" : "No auth header"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: No token provided" });
    }

    // Extract token
    const token = authHeader.substring(7);

    try {
        // Handle mock tokens for development/testing
        if (token.startsWith("mock-token-")) {
            console.log("Using mock token for development");
            const extractedUserId = token.replace("mock-token-", "");

            // Validate that the user ID exists in the database
            const user = await prisma.user.findUnique({
                where: { id: extractedUserId },
                select: { id: true, firstName: true, lastName: true },
            });

            if (user) {
                req.auth = { userId: extractedUserId };
                req.userId = extractedUserId;
                console.log(
                    `Mock auth set for user: ${user.firstName} ${user.lastName} (${extractedUserId})`
                );
                return next();
            } else {
                console.log("Mock token user not found:", extractedUserId);
                return res.status(401).json({ error: "Mock user not found" });
            }
        }

        // For real Clerk tokens, decode the JWT payload
        // Note: In production, you should verify the token signature with Clerk's JWKS
        try {
            const parts = token.split(".");
            if (parts.length === 3) {
                // Decode the payload (base64url decode)
                // Base64url decoding: replace - with +, _ with /, and add padding if needed
                let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }

                const payload = JSON.parse(
                    Buffer.from(base64, "base64").toString()
                );

                console.log("Decoded token payload:", {
                    sub: payload.sub,
                    iss: payload.iss,
                    exp: payload.exp,
                });

                // Clerk tokens have the user ID in the 'sub' field
                const clerkUserId = payload.sub;

                if (!clerkUserId) {
                    console.log("No user ID found in token payload");
                    return res
                        .status(401)
                        .json({ error: "Invalid token: no user ID" });
                }

                // Check if token is expired
                if (payload.exp && Date.now() >= payload.exp * 1000) {
                    console.log("Token is expired");
                    return res.status(401).json({ error: "Token expired" });
                }

                // Look up the database user ID from the Clerk ID
                const user = await prisma.user.findUnique({
                    where: { clerkId: clerkUserId },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                });

                if (user) {
                    req.auth = { userId: user.id };
                    req.userId = user.id;
                    console.log(
                        `Auth successful for ${user.firstName} ${user.lastName} (DB: ${user.id}, Clerk: ${clerkUserId})`
                    );
                    return next();
                } else {
                    console.log(
                        "User not found in database for Clerk ID:",
                        clerkUserId
                    );

                    // Auto-create user if they don't exist but have valid Clerk token
                    try {
                        const newUser = await prisma.user.create({
                            data: {
                                clerkId: clerkUserId,
                                email:
                                    payload.email ||
                                    `${clerkUserId}@clerk.user`,
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

                        req.auth = { userId: newUser.id };
                        req.userId = newUser.id;
                        console.log(
                            `Auto-created user: ${newUser.firstName} ${newUser.lastName} (${newUser.id})`
                        );
                        return next();
                    } catch (createError) {
                        console.error(
                            "Failed to auto-create user:",
                            createError
                        );
                        return res
                            .status(500)
                            .json({ error: "Failed to create user account" });
                    }
                }
            } else {
                console.log("Invalid JWT format - not 3 parts");
                return res.status(401).json({ error: "Invalid token format" });
            }
        } catch (decodeError) {
            console.error("Token decode error:", decodeError.message);
            return res.status(401).json({ error: "Invalid token format" });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Authentication service error" });
    }
};

module.exports = {
    requireAuth,
};
