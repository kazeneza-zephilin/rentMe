const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUsersFromClerk() {
    try {
        console.log("🔄 Creating users from Clerk accounts...");

        // You'll need to replace these with your actual Clerk user data
        // You can get this from your Clerk dashboard or by calling Clerk's API

        const clerkUsers = [
            {
                id: "user_clerk_id_1", // Replace with actual Clerk user ID
                email_addresses: [{ email_address: "your-email1@example.com" }],
                first_name: "Your",
                last_name: "Name1",
                profile_image_url: null,
            },
            {
                id: "user_clerk_id_2", // Replace with actual Clerk user ID
                email_addresses: [{ email_address: "your-email2@example.com" }],
                first_name: "Your",
                last_name: "Name2",
                profile_image_url: null,
            },
        ];

        for (const userData of clerkUsers) {
            try {
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { clerkId: userData.id },
                });

                if (existingUser) {
                    console.log(
                        `✓ User ${userData.email_addresses[0].email_address} already exists`
                    );
                    continue;
                }

                // Create new user
                const newUser = await prisma.user.create({
                    data: {
                        clerkId: userData.id,
                        email: userData.email_addresses[0].email_address,
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                        avatar: userData.profile_image_url,
                    },
                });

                console.log(
                    `✅ Created user: ${newUser.email} (${newUser.id})`
                );
            } catch (error) {
                console.error(
                    `❌ Error creating user ${userData.email_addresses[0].email_address}:`,
                    error.message
                );
            }
        }

        // Show all users
        console.log("\n📋 All users in database:");
        const allUsers = await prisma.user.findMany();
        allUsers.forEach((user) => {
            console.log(
                `- ${user.email} (DB ID: ${user.id.substring(
                    0,
                    8
                )}..., Clerk ID: ${user.clerkId})`
            );
        });
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

console.log("⚠️  IMPORTANT: Before running this script, please:");
console.log("1. Go to your Clerk dashboard");
console.log("2. Find your user IDs and email addresses");
console.log("3. Update the clerkUsers array in this file");
console.log("4. Then run: node sync_clerk_users.js");
console.log("");

// Uncomment the line below after updating the user data
// createUsersFromClerk();
