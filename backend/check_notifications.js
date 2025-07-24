const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkNotifications() {
    try {
        console.log("🔔 Checking notifications...");

        const notifications = await prisma.notification.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });

        console.log(`Found ${notifications.length} notifications:`);
        notifications.forEach((notification) => {
            console.log(
                `\n📢 Notification for ${notification.user.firstName} ${notification.user.lastName}:`
            );
            console.log(`- Title: ${notification.title}`);
            console.log(`- Type: ${notification.type}`);
            console.log(`- Message: ${notification.message}`);
            console.log(`- Read: ${notification.read}`);
            console.log(`- Created: ${notification.createdAt.toISOString()}`);
        });

        // Check bookings status
        console.log("\n📋 Current booking status:");
        const bookings = await prisma.booking.findMany({
            include: {
                user: true,
                listing: { include: { owner: true } },
            },
        });

        bookings.forEach((booking) => {
            console.log(`\n- Booking ${booking.id}:`);
            console.log(
                `  Renter: ${booking.user.firstName} ${booking.user.lastName}`
            );
            console.log(
                `  Listing: "${booking.listing.title}" (owner: ${booking.listing.owner.firstName})`
            );
            console.log(`  Status: ${booking.status}`);
        });
    } catch (error) {
        console.error("❌ Error checking notifications:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNotifications();
