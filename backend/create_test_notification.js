const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestNotification() {
    try {
        console.log("🔔 Creating test notification...");

        const notification = await prisma.notification.create({
            data: {
                userId: "cmdhg17wp0000ev8bac2ktfwd",
                type: "test",
                title: "Welcome to RentMe!",
                message:
                    "Your notification system is working correctly. You'll receive updates about bookings and messages here.",
                read: false,
            },
        });

        console.log("✅ Test notification created:", notification);
    } catch (error) {
        console.error("❌ Error creating test notification:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestNotification();
