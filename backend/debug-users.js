const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function fixUserClerkIdIssue() {
    try {
        console.log("=== FIXING USER CLERK ID ISSUE ===");

        // First, let's see all users
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                clerkId: true,
                firstName: true,
                lastName: true,
                email: true,
                _count: {
                    select: { listings: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log("\n=== ALL USERS ===");
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`);
            console.log(`   Clerk ID: ${user.clerkId}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Listings: ${user._count.listings}`);
            console.log("---");
        });

        // Find the user with Clerk ID ending in Wuxb (your original user)
        const originalUser = await prisma.user.findFirst({
            where: {
                clerkId: {
                    endsWith: "Wuxb",
                },
            },
        });

        // Find any duplicate users with "User User" name that might be your new sessions
        const duplicateUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { firstName: "User" },
                    { lastName: "User" },
                    { clerkId: { not: originalUser?.clerkId || "" } },
                ],
            },
            include: {
                listings: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                    },
                },
            },
        });

        console.log("\n=== ORIGINAL USER (Wuxb) ===");
        if (originalUser) {
            console.log(`ID: ${originalUser.id}`);
            console.log(`Clerk ID: ${originalUser.clerkId}`);
            console.log(
                `Name: ${originalUser.firstName} ${originalUser.lastName}`
            );
        } else {
            console.log("No user found with Clerk ID ending in Wuxb");
        }

        console.log("\n=== DUPLICATE USERS (User User) ===");
        duplicateUsers.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`);
            console.log(`   Clerk ID: ${user.clerkId}`);
            console.log(`   Listings: ${user.listings.length}`);
            if (user.listings.length > 0) {
                user.listings.forEach((listing) => {
                    console.log(`   - ${listing.title} (${listing.createdAt})`);
                });
            }
            console.log("---");
        });

        // If there are duplicate users with listings, we need to merge them
        if (duplicateUsers.length > 0 && originalUser) {
            console.log("\n=== PROPOSED FIX ===");
            console.log(
                'We found duplicate "User User" accounts that should be merged with your original account.'
            );
            console.log("This script can:");
            console.log(
                "1. Transfer all listings from duplicate accounts to your original account"
            );
            console.log("2. Delete the duplicate accounts");
            console.log("3. Update your original account name if needed");
            console.log(
                "\nTo execute the fix, uncomment the fixData() call at the bottom of this script."
            );
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function fixData() {
    try {
        console.log("=== EXECUTING FIX ===");

        // Find original user
        const originalUser = await prisma.user.findFirst({
            where: {
                clerkId: { endsWith: "Wuxb" },
            },
        });

        if (!originalUser) {
            console.log("Cannot find original user ending with Wuxb");
            return;
        }

        // Find duplicate users
        const duplicateUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { firstName: "User" },
                    { lastName: "User" },
                    { clerkId: { not: originalUser.clerkId } },
                ],
            },
        });

        console.log(`Found ${duplicateUsers.length} duplicate users to merge`);

        // Transfer listings from duplicate users to original user
        for (const duplicateUser of duplicateUsers) {
            console.log(
                `Transferring listings from ${duplicateUser.clerkId}...`
            );

            const updateResult = await prisma.listing.updateMany({
                where: {
                    ownerId: duplicateUser.id,
                },
                data: {
                    ownerId: originalUser.id,
                },
            });

            console.log(`Transferred ${updateResult.count} listings`);

            // Delete the duplicate user
            await prisma.user.delete({
                where: { id: duplicateUser.id },
            });
            console.log(`Deleted duplicate user ${duplicateUser.id}`);
        }

        // Update original user with better name (optional)
        const updatedUser = await prisma.user.update({
            where: { id: originalUser.id },
            data: {
                firstName: "Your Name", // Change this to your actual name
                lastName: "Here", // Change this to your actual name
            },
        });

        console.log("=== FIX COMPLETE ===");
        console.log(
            `Updated user: ${updatedUser.firstName} ${updatedUser.lastName}`
        );

        // Show final state
        const finalListings = await prisma.listing.findMany({
            where: { ownerId: originalUser.id },
            select: { id: true, title: true, createdAt: true },
        });

        console.log(`Final listings count: ${finalListings.length}`);
        finalListings.forEach((listing) => {
            console.log(`- ${listing.title}`);
        });
    } catch (error) {
        console.error("Error during fix:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run diagnosis
fixUserClerkIdIssue();

// Uncomment the line below to execute the fix after reviewing the diagnosis
// fixData();
