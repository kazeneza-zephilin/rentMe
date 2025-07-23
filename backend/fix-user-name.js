const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function fixUserName() {
    try {
        console.log("=== FIXING USER NAME ===");

        // Find your user
        const user = await prisma.user.findFirst({
            where: {
                clerkId: { endsWith: "Wuxb" },
            },
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log("Current user:");
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Clerk ID: ${user.clerkId}`);

        // Update the user name
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: "Your", // Change this to your actual first name
                lastName: "Name", // Change this to your actual last name
            },
        });

        console.log("\nUpdated user:");
        console.log(`Name: ${updatedUser.firstName} ${updatedUser.lastName}`);

        // Verify listings are still there
        const listings = await prisma.listing.findMany({
            where: { ownerId: user.id },
            select: { id: true, title: true },
        });

        console.log(`\nListings still owned by this user: ${listings.length}`);
        listings.forEach((listing) => {
            console.log(`- ${listing.title}`);
        });

        console.log(
            "\n✅ Fix complete! Your listings should now show the correct owner name."
        );
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserName();
