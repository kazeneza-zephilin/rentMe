const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUserAuth() {
    console.log("=== User Authentication Check ===\n");

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                clerkId: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        });

        console.log("Users in database:");
        users.forEach((user) => {
            console.log(`  - ${user.firstName} ${user.lastName}`);
            console.log(`    DB ID: ${user.id}`);
            console.log(`    Clerk ID: ${user.clerkId}`);
            console.log(`    Email: ${user.email}`);
            console.log("");
        });

        // Get the specific chat we're having trouble with
        const chatId = "cmdiojrza0001kg1d67dqgbtb";
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
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

        if (chat) {
            console.log(`\nChat ${chatId} details:`);
            console.log(
                `Owner: ${chat.owner.firstName} ${chat.owner.lastName} (DB: ${chat.owner.id}, Clerk: ${chat.owner.clerkId})`
            );
            console.log(
                `Renter: ${chat.renter.firstName} ${chat.renter.lastName} (DB: ${chat.renter.id}, Clerk: ${chat.renter.clerkId})`
            );
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserAuth();
