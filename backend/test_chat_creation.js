const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testChatCreation() {
    try {
        console.log("🧪 Testing chat creation...");

        // Get the current booking
        const booking = await prisma.booking.findFirst({
            where: { status: "CONFIRMED" },
        });

        if (!booking) {
            console.log("❌ No confirmed booking found");
            return;
        }

        console.log(`📋 Found booking: ${booking.id}`);

        // Check if chat already exists
        let existingChat = await prisma.chat.findFirst({
            where: { bookingId: booking.id },
        });

        if (existingChat) {
            console.log("🗑️ Deleting existing chat for fresh test...");
            await prisma.chat.delete({
                where: { id: existingChat.id },
            });
        }

        // Try to create a chat
        console.log("💬 Creating chat...");
        const chat = await prisma.chat.create({
            data: { bookingId: booking.id },
        });

        console.log("✅ Chat created successfully!");
        console.log(`Chat ID: ${chat.id}`);
        console.log(`Booking ID: ${chat.bookingId}`);

        // Verify the chat exists
        const verifyChat = await prisma.chat.findUnique({
            where: { id: chat.id },
            include: { booking: true },
        });

        if (verifyChat) {
            console.log("✅ Chat verification successful!");
            console.log(`Associated with booking: ${verifyChat.booking.id}`);
        } else {
            console.log("❌ Chat verification failed");
        }
    } catch (error) {
        console.error("❌ Error testing chat creation:", error);
        console.error("Error details:", error.message);
        if (error.code) {
            console.error("Error code:", error.code);
        }
        if (error.meta) {
            console.error("Error meta:", error.meta);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testChatCreation();
