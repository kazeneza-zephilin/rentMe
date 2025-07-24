const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestBooking() {
    try {
        console.log("📅 Creating test booking for bike...");

        // Delete the existing self-booking
        await prisma.booking.deleteMany({
            where: { listingId: "cmdhhyhgu000112g3s2f1v7hc" },
        });

        // Create booking from the other user to zephilin's bike
        const otherUserId = "cmdhi50w600014092kwppylbm"; // The third user
        const bikeListingId = "cmdhhyhgu000112g3s2f1v7hc";

        const booking = await prisma.booking.create({
            data: {
                userId: otherUserId,
                listingId: bikeListingId,
                startDate: new Date("2025-07-25"),
                endDate: new Date("2025-07-28"),
                totalCost: 39.0, // 3 days * 13
                status: "PENDING",
                message:
                    "Hi! I'd love to rent your bike for the weekend. Is it available?",
            },
        });

        console.log("✅ Created booking:", booking);

        // Update the other user to have a proper name
        const updatedUser = await prisma.user.update({
            where: { id: otherUserId },
            data: {
                email: "john@example.com",
                firstName: "John",
                lastName: "Doe",
            },
        });

        console.log("✅ Updated renter user:", updatedUser);

        // Show the booking with details
        const bookingWithDetails = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: {
                user: true,
                listing: {
                    include: { owner: true },
                },
            },
        });

        console.log("\n📋 Booking Details:");
        console.log(
            `- ${bookingWithDetails.user.firstName} ${bookingWithDetails.user.lastName} wants to rent`
        );
        console.log(
            `- "${bookingWithDetails.listing.title}" from ${bookingWithDetails.listing.owner.firstName} ${bookingWithDetails.listing.owner.lastName}`
        );
        console.log(`- Status: ${bookingWithDetails.status}`);
        console.log(`- Message: "${bookingWithDetails.message}"`);
    } catch (error) {
        console.error("❌ Error creating test booking:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestBooking();
