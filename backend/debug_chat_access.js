const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugChatAccess() {
    const chatId = "cmdiojrza0001kg1d67dqgbtb";

    console.log(`\n=== Debugging Chat Access for Chat ID: ${chatId} ===\n`);

    try {
        // 1. Check if the chat exists
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        ownerId: true,
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
                owner: {
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
            console.log("❌ Chat does not exist in database");
            return;
        }

        console.log("✅ Chat found:");
        console.log(`   - Chat ID: ${chat.id}`);
        console.log(`   - Renter ID: ${chat.renterId}`);
        console.log(`   - Owner ID: ${chat.ownerId}`);
        console.log(`   - Listing ID: ${chat.listingId}`);
        console.log(`   - Listing Title: ${chat.listing.title}`);
        console.log(`   - Listing Owner ID: ${chat.listing.ownerId}`);

        console.log("\n📋 Renter Details:");
        console.log(`   - Database ID: ${chat.renter.id}`);
        console.log(`   - Clerk ID: ${chat.renter.clerkId}`);
        console.log(
            `   - Name: ${chat.renter.firstName} ${chat.renter.lastName}`
        );
        console.log(`   - Email: ${chat.renter.email}`);

        console.log("\n📋 Owner Details:");
        console.log(`   - Database ID: ${chat.owner.id}`);
        console.log(`   - Clerk ID: ${chat.owner.clerkId}`);
        console.log(
            `   - Name: ${chat.owner.firstName} ${chat.owner.lastName}`
        );
        console.log(`   - Email: ${chat.owner.email}`);

        // 2. Check if owner ID matches listing owner ID
        if (chat.ownerId !== chat.listing.ownerId) {
            console.log(
                "\n⚠️  WARNING: Chat owner ID doesn't match listing owner ID!"
            );
            console.log(`   Chat owner ID: ${chat.ownerId}`);
            console.log(`   Listing owner ID: ${chat.listing.ownerId}`);
        } else {
            console.log("\n✅ Chat owner ID matches listing owner ID");
        }

        // 3. Check all users to see possible matches
        console.log("\n👥 All users in database:");
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                clerkId: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });

        allUsers.forEach((user) => {
            console.log(
                `   - ${user.firstName} ${user.lastName} (${user.email})`
            );
            console.log(`     DB ID: ${user.id}`);
            console.log(`     Clerk ID: ${user.clerkId}`);
            console.log("");
        });

        // 4. Test auth with common user IDs
        console.log("🔍 Testing potential user access:");
        for (const user of allUsers) {
            const hasAccess =
                chat.renterId === user.id || chat.ownerId === user.id;
            console.log(
                `   - ${user.firstName} ${user.lastName}: ${
                    hasAccess ? "✅ HAS ACCESS" : "❌ NO ACCESS"
                }`
            );
        }
    } catch (error) {
        console.error("Error debugging chat access:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugChatAccess();
