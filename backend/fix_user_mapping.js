const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixUserMapping() {
    try {
        console.log("🔧 Fixing user mapping for zephilin...");

        // Update one of the Clerk users to be zephilin
        const zephilinUser = await prisma.user.update({
            where: { clerkId: "user_30EUPWEgnLQuBnzt2EvJFksWuxb" }, // Using the first Clerk user
            data: {
                email: "zephilin@example.com",
                firstName: "Zephilin",
                lastName: "Kazeneza",
            },
        });

        console.log("✅ Updated user to be zephilin:", zephilinUser);

        // Transfer the bike listing to zephilin
        const bikeListingUpdate = await prisma.listing.update({
            where: { id: "cmdhhyhgu000112g3s2f1v7hc" }, // The bike listing ID
            data: {
                ownerId: zephilinUser.id,
            },
        });

        console.log(
            "✅ Transferred bike listing to zephilin:",
            bikeListingUpdate.title
        );

        // Check final state
        console.log("\n📋 Final user mapping:");
        const allUsers = await prisma.user.findMany();
        allUsers.forEach((user) => {
            console.log(
                `- ${user.firstName} ${user.lastName} (${user.email}) - Clerk ID: ${user.clerkId}`
            );
        });

        console.log("\n📋 Listings by owner:");
        const listings = await prisma.listing.findMany({
            include: { owner: true },
        });
        listings.forEach((listing) => {
            console.log(
                `- "${listing.title}" owned by ${listing.owner.firstName} ${listing.owner.lastName}`
            );
        });
    } catch (error) {
        console.error("❌ Error fixing user mapping:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserMapping();
