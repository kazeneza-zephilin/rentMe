const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testChatAccess() {
    const chatId = "cmdiojrza0001kg1d67dqgbtb";

    console.log("=== Testing Chat Access ===\n");

    try {
        // Get the problematic chat
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                listing: {
                    select: {
                        title: true,
                        ownerId: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                renter: {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!chat) {
            console.log("❌ Chat not found!");
            return;
        }

        console.log("✅ Chat found:");
        console.log(`   Listing: ${chat.listing.title}`);
        console.log(`   Owner: ${chat.owner.firstName} ${chat.owner.lastName}`);
        console.log(`   - Database ID: ${chat.owner.id}`);
        console.log(`   - Clerk ID: ${chat.owner.clerkId}`);
        console.log(`   - Email: ${chat.owner.email}`);
        console.log(
            `   Renter: ${chat.renter.firstName} ${chat.renter.lastName}`
        );
        console.log(`   - Database ID: ${chat.renter.id}`);
        console.log(`   - Clerk ID: ${chat.renter.clerkId}`);
        console.log(`   - Email: ${chat.renter.email}`);

        console.log("\n🔑 For authentication to work:");
        console.log(
            `   Owner must be signed in with Clerk ID: ${chat.owner.clerkId}`
        );
        console.log(
            `   Renter must be signed in with Clerk ID: ${chat.renter.clerkId}`
        );

        console.log("\n📋 Test Steps:");
        console.log("1. Sign in as owner with the email above");
        console.log(
            "2. Try to access the chat from notifications or chats page"
        );
        console.log("3. Check backend logs to see if authentication works");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testChatAccess();
