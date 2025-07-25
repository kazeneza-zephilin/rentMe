const { PrismaClient } = require("@prisma/client");

// Singleton pattern for Prisma Client
let prisma;

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
} else {
    // In development, use a global variable to preserve the instance across module reloads
    if (!global.__prisma) {
        global.__prisma = new PrismaClient({
            log: ["error", "warn"], // Only log errors and warnings in development
        });
    }
    prisma = global.__prisma;
}

// Graceful shutdown handler
const gracefulShutdown = async () => {
    console.log("Disconnecting Prisma client...");
    await prisma.$disconnect();
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("beforeExit", gracefulShutdown);

module.exports = prisma;
