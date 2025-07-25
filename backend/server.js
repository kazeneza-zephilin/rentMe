const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

// Initialize Prisma
const prisma = new PrismaClient();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const listingRoutes = require("./routes/listings");
const bookingRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const { router: notificationRoutes } = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware for debugging
app.use((req, res, next) => {
    const start = Date.now();

    // Log request
    console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);

    // Log response when it finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusEmoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";
        console.log(
            `📤 ${statusEmoji} ${req.method} ${req.url} - ${status} - ${duration}ms`
        );
    });

    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("🚨 Global Error Handler:", {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        body: req.body,
        params: req.params,
        query: req.query,
    });

    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: "Validation Error",
            details: err.message,
        });
    }

    if (err.code === "P2002") {
        return res.status(409).json({
            error: "Conflict",
            message: "A record with this data already exists",
        });
    }

    // Check for database connection errors
    if (err.code === "P1001" || err.code === "P1008" || err.code === "P1017") {
        console.error("🚨 Database connection error detected!");
        return res.status(503).json({
            error: "Database temporarily unavailable",
        });
    }

    res.status(err.status || 500).json({
        error:
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
    console.error("Stack trace:", reason.stack);
    // Don't exit the process for unhandled rejections in development
    if (process.env.NODE_ENV === "production") {
        console.log("Exiting due to unhandled rejection in production");
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("🚨 Uncaught Exception:", error);
    console.error("Stack trace:", error.stack);
    // Exit the process for uncaught exceptions as they can leave the app in an undefined state
    console.log("Exiting due to uncaught exception");
    process.exit(1);
});

// Add process monitoring
const logMemoryUsage = () => {
    const usage = process.memoryUsage();
    console.log("📊 Memory Usage:", {
        rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(usage.external / 1024 / 1024)} MB`,
    });
};

// Log memory usage every 30 seconds in development
if (process.env.NODE_ENV !== "production") {
    setInterval(logMemoryUsage, 30000);
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
