import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MessageThread from "@/components/MessageThread";
import AirbnbBookingForm from "@/components/AirbnbBookingForm";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";

const ListingDetail = () => {
    const { id } = useParams();
    const api = useApi();
    const { isSignedIn, userId } = useAuth();
    const [showBookingForm, setShowBookingForm] = useState(false);

    const {
        data: listing,
        isLoading,
        error,
    } = useQuery(["listing", id], async () => {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading listing: {error.message}
                </div>
            </div>
        );
    }

    const isOwner = isSignedIn && listing?.owner?.clerkId === userId;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Image Gallery */}
                    <div className="mb-6">
                        <img
                            src={
                                listing?.images?.[0] || "/placeholder-image.jpg"
                            }
                            alt={listing?.title}
                            className="w-full h-96 object-cover rounded-lg"
                        />
                        {listing?.images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {listing.images
                                    .slice(1, 5)
                                    .map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${listing.title} ${
                                                index + 2
                                            }`}
                                            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                        />
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Listing Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-4">
                                {listing?.title}
                            </h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {listing?.category}
                                </span>
                                <span className="text-gray-600">
                                    📍 {listing?.location}
                                </span>
                                <span className="text-2xl font-bold text-green-600">
                                    ${listing?.price}/day
                                </span>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-3">
                                About this item
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {listing?.description}
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {listing?.owner?.firstName?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Hosted by{" "}
                                            {listing?.owner?.firstName}{" "}
                                            {listing?.owner?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {listing?.owner?.email}
                                        </p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        {!isSignedIn ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Sign in to Contact Owner
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4">
                                        You need to sign in to message the owner
                                        and book this item.
                                    </p>
                                    <Button className="w-full">Sign In</Button>
                                </CardContent>
                            </Card>
                        ) : isOwner ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Listing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4">
                                        This is your listing. Check your Chats
                                        to see messages from interested renters.
                                    </p>
                                    <Button className="w-full">
                                        Edit Listing
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Prominent Booking CTA */}
                                <Card className="border-2 border-blue-500 shadow-lg">
                                    <CardHeader className="text-center pb-2">
                                        <CardTitle className="text-2xl text-blue-600">
                                            ${listing?.price}/day
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <Button
                                            onClick={() =>
                                                setShowBookingForm(true)
                                            }
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg mb-3"
                                            size="lg"
                                        >
                                            Book Now
                                        </Button>
                                        <p className="text-sm text-gray-500">
                                            You won't be charged yet
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Contact Owner Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Contact Owner</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4">
                                            Have questions? Message the owner
                                            before booking.
                                        </p>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Message Thread - Show for renters only */}
                        {isSignedIn && !isOwner && (
                            <MessageThread
                                listing={listing}
                                onStartBooking={() => setShowBookingForm(true)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Airbnb-style Booking Modal */}
            {showBookingForm && (
                <AirbnbBookingForm
                    listing={listing}
                    onClose={() => setShowBookingForm(false)}
                />
            )}
        </div>
    );
};

export default ListingDetail;
