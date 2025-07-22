const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    // Create sample users (these would normally come from Clerk)
    const user1 = await prisma.user.upsert({
        where: { clerkId: "clerk_user_1" },
        update: {},
        create: {
            clerkId: "clerk_user_1",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            phone: "+1234567890",
        },
    });

    const user2 = await prisma.user.upsert({
        where: { clerkId: "clerk_user_2" },
        update: {},
        create: {
            clerkId: "clerk_user_2",
            email: "jane@example.com",
            firstName: "Jane",
            lastName: "Smith",
            phone: "+0987654321",
        },
    });

    // Create sample listings
    const listing1 = await prisma.listing.create({
        data: {
            title: "Professional Camera Kit",
            description:
                "High-quality DSLR camera with lenses and accessories perfect for photography and videography.",
            price: 50.0,
            category: "Electronics",
            location: "New York, NY",
            images: [
                "https://example.com/camera1.jpg",
                "https://example.com/camera2.jpg",
            ],
            ownerId: user1.id,
        },
    });

    const listing2 = await prisma.listing.create({
        data: {
            title: "Mountain Bike",
            description:
                "High-performance mountain bike perfect for trail riding and outdoor adventures.",
            price: 25.0,
            category: "Sports",
            location: "San Francisco, CA",
            images: ["https://example.com/bike1.jpg"],
            ownerId: user2.id,
        },
    });

    // Create sample bookings
    await prisma.booking.create({
        data: {
            startDate: new Date("2024-02-15"),
            endDate: new Date("2024-02-18"),
            totalCost: 150.0,
            status: "CONFIRMED",
            message: "Need this for a wedding shoot",
            userId: user2.id,
            listingId: listing1.id,
        },
    });

    // Create sample reviews
    await prisma.review.create({
        data: {
            rating: 5,
            comment: "Amazing camera quality! Owner was very helpful.",
            userId: user2.id,
            listingId: listing1.id,
        },
    });

    console.log("Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
