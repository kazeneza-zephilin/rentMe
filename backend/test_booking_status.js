const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testBookingStatus() {
    try {
        console.log("🔍 Checking current bookings...");

        // Get all bookings
        const bookings = await prisma.booking.findMany({
            include: {
                user: true,
                listing: {
                    include: { owner: true },
                },
            },
        });

        console.log(`Found ${bookings.length} bookings:`);
        bookings.forEach((booking) => {
            console.log(`\n📋 Booking ID: ${booking.id}`);
            console.log(
                `- Renter: ${booking.user.firstName} ${booking.user.lastName}`
            );
            console.log(`- Listing: "${booking.listing.title}"`);
            console.log(
                `- Owner: ${booking.listing.owner.firstName} ${booking.listing.owner.lastName}`
            );
            console.log(`- Status: ${booking.status}`);
            console.log(`- Total Cost: $${booking.totalCost}`);
        });

        // Test updating a booking status if we have one
        if (bookings.length > 0) {
            const testBooking = bookings[0];
            console.log(
                `\n🧪 Testing status update for booking ${testBooking.id}...`
            );

            // Try to update to CONFIRMED
            const updatedBooking = await prisma.booking.update({
                where: { id: testBooking.id },
                data: { status: "CONFIRMED" },
                include: {
                    user: true,
                    listing: {
                        include: { owner: true },
                    },
                },
            });

            console.log("✅ Status update successful!");
            console.log(`New status: ${updatedBooking.status}`);

            // Check if chat was created
            const chat = await prisma.chat.findFirst({
                where: { bookingId: testBooking.id },
            });

            if (chat) {
                console.log("✅ Chat created successfully!");
                console.log(`Chat ID: ${chat.id}`);
            } else {
                console.log("❌ No chat found for this booking");
            }
        } else {
            console.log("❌ No bookings found to test");
        }
    } catch (error) {
        console.error("❌ Error testing booking status:", error);
        console.error("Error details:", error.message);
        if (error.code) {
            console.error("Error code:", error.code);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testBookingStatus();
