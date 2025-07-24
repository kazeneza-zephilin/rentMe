const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log("🌱 Seeding database...");

        // Create a test user
        const testUser = await prisma.user.upsert({
            where: { email: "test@example.com" },
            update: {},
            create: {
                clerkId: "test_clerk_id",
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
            },
        });

        console.log("✅ Test user created:", testUser.id);

        // Create a test listing
        const testListing = await prisma.listing.upsert({
            where: { id: "test_listing_id" },
            update: {},
            create: {
                id: "test_listing_id",
                title: "Test Coffee Machine",
                description: "A test coffee machine for rental",
                price: 25.0,
                category: "Electronics",
                location: "Test City",
                images: ["test-image.jpg"],
                ownerId: testUser.id,
            },
        });

        console.log("✅ Test listing created:", testListing.id);
        console.log("🎉 Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
