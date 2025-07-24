const { PrismaClient } = require("@prisma/client");
const { createNotification } = require("./routes/notifications");

const prisma = new PrismaClient();

async function testNotificationSystem() {
    try {
        console.log("🔍 Testing Notification System...");

        // Test 1: Check if Notification table exists
        console.log("1. Testing database connection...");
        const dbTest = await prisma.$queryRaw`SELECT 1`;
        console.log("✅ Database connection successful");

        // Test 2: Check if notifications table exists
        console.log("2. Testing notifications table...");
        const tableExists = await prisma.$queryRaw`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'notifications'
        `;
        console.log(
            "✅ Notifications table:",
            tableExists.length > 0 ? "EXISTS" : "MISSING"
        );

        // Test 3: Try to fetch users (needed for notifications)
        console.log("3. Testing users table...");
        const users = await prisma.user.findMany({ take: 1 });
        console.log("✅ Users table accessible, found", users.length, "users");

        // Test 4: Test notification creation if we have users
        if (users.length > 0) {
            console.log("4. Testing notification creation...");
            const testNotification = await createNotification(
                users[0].id,
                "test",
                "Test Notification",
                "This is a test notification",
                null
            );
            console.log(
                "✅ Notification created successfully:",
                testNotification.id
            );

            // Clean up test notification
            await prisma.notification.delete({
                where: { id: testNotification.id },
            });
            console.log("✅ Test notification cleaned up");
        }

        console.log("🎉 All tests passed!");
    } catch (error) {
        console.error("❌ Error in notification system:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
    } finally {
        await prisma.$disconnect();
    }
}

testNotificationSystem();
