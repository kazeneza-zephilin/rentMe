const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users in database:", JSON.stringify(users, null, 2));

        if (users.length > 0) {
            console.log("\nFirst user ID:", users[0].id);
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
