const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function simulateBookingStatusUpdate() {
    try {
        console.log("🧪 Testing full booking status update flow...");

        // Reset the booking status back to PENDING for testing
        const booking = await prisma.booking.findFirst();
        if (!booking) {
            console.log("❌ No booking found");
            return;
        }

        console.log(`📋 Testing with booking: ${booking.id}`);

        // Delete any existing chat first
        await prisma.chat.deleteMany({
            where: { bookingId: booking.id },
        });

        // Reset status to PENDING
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "PENDING" },
        });

        console.log("🔄 Reset booking to PENDING");

        // Now simulate the full update logic from the route
        console.log("📤 Simulating route logic...");

        // Get booking with all includes like the route does
        const bookingWithDetails = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: { listing: true },
        });

        if (!bookingWithDetails) {
            console.log("❌ Booking not found");
            return;
        }

        console.log(
            `✅ Found booking for listing: ${bookingWithDetails.listing.title}`
        );

        // Update the booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "CONFIRMED" },
            include: {
                listing: true,
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
            },
        });

        console.log("✅ Booking status updated to CONFIRMED");

        // Create chat when booking is confirmed (like in the route)
        console.log("💬 Creating chat...");
        const chat = await prisma.chat.create({
            data: { bookingId: booking.id },
        });

        console.log(`✅ Chat created with ID: ${chat.id}`);

        // Simulate notification creation (without the actual notification)
        console.log("📢 Notification would be created here...");

        console.log("\n🎉 Full booking status update simulation successful!");
    } catch (error) {
        console.error("❌ Error in booking status update:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        if (error.meta) {
            console.error("Error meta:", error.meta);
        }
    } finally {
        await prisma.$disconnect();
    }
}

simulateBookingStatusUpdate();
