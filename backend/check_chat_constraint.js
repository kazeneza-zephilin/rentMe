const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkChatConstraint() {
    try {
        console.log("🔍 Checking existing chats...");

        const chats = await prisma.chat.findMany({
            include: { booking: true },
        });

        console.log(`Found ${chats.length} chats:`);
        chats.forEach((chat) => {
            console.log(`- Chat ID: ${chat.id}, Booking ID: ${chat.bookingId}`);
        });

        // Check if there's already a chat for our test booking
        const testBookingId = "cmdhjl57o0001laws7q4lr1iw";
        const existingChat = await prisma.chat.findFirst({
            where: { bookingId: testBookingId },
        });

        if (existingChat) {
            console.log(`❌ Chat already exists for booking ${testBookingId}`);
            console.log(`Existing chat ID: ${existingChat.id}`);
            console.log(
                "This will cause a unique constraint violation when trying to create another chat."
            );
        } else {
            console.log(
                `✅ No existing chat found for booking ${testBookingId}`
            );
        }
    } catch (error) {
        console.error("❌ Error checking chats:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkChatConstraint();
