const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("../middleware/auth");
const { createNotification } = require("./notifications");

const router = express.Router();
const prisma = new PrismaClient();

// Get user's bookings
router.get("/", requireAuth, async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.userId },
            include: {
                listing: {
                    include: {
                        owner: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Create a booking request
router.post("/", requireAuth, async (req, res) => {
    try {
        const { listingId, startDate, endDate, message } = req.body;

        // Get listing to calculate cost
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { owner: true },
        });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        if (listing.ownerId === req.userId) {
            return res
                .status(400)
                .json({ error: "Cannot book your own listing" });
        }

        // Calculate days and total cost
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalCost = days * parseFloat(listing.price);

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: req.userId,
                listingId,
                startDate: start,
                endDate: end,
                totalCost,
                message,
                status: "PENDING",
            },
            include: {
                listing: {
                    include: {
                        owner: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({ booking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// Get bookings for a listing (owner only)
router.get("/listing/:listingId", requireAuth, async (req, res) => {
    try {
        const { listingId } = req.params;

        // Check if user owns the listing
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing || listing.ownerId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const bookings = await prisma.booking.findMany({
            where: { listingId },
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
                listing: {
                    select: { id: true, title: true, price: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ bookings });
    } catch (error) {
        console.error("Error fetching listing bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Update booking status (owner only)
router.patch("/:id/status", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { listing: true },
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.listing.ownerId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                listing: true,
                user: {
                    select: { firstName: true, lastName: true, email: true },
                },
            },
        });

        // Create chat when booking is confirmed (if not already exists)
        if (status === "CONFIRMED") {
            const existingChat = await prisma.chat.findFirst({
                where: { bookingId: id },
            });

            if (!existingChat) {
                await prisma.chat.create({
                    data: { bookingId: id },
                });
            }
        }

        // Create notification for status change
        try {
            let notificationTitle, notificationMessage;

            if (status === "CONFIRMED") {
                notificationTitle = "Booking Confirmed!";
                notificationMessage = `Your booking for "${booking.listing.title}" has been confirmed. You can now chat with the owner about delivery details.`;
            } else if (status === "CANCELLED") {
                notificationTitle = "Booking Cancelled";
                notificationMessage = `Your booking for "${booking.listing.title}" has been cancelled.`;
            } else if (status === "COMPLETED") {
                notificationTitle = "Booking Completed";
                notificationMessage = `Your booking for "${booking.listing.title}" has been completed. Please leave a review!`;
            }

            if (notificationTitle) {
                await createNotification(
                    booking.userId,
                    "booking_status",
                    notificationTitle,
                    notificationMessage,
                    booking.id
                );
            }
        } catch (notificationError) {
            console.error(
                "Error creating booking notification:",
                notificationError
            );
            // Don't fail the status update if notification fails
        }

        res.json({ booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ error: "Failed to update booking status" });
    }
});

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Bookings routes working" });
});

module.exports = router;
