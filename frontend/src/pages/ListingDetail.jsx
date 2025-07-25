import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingForm from "@/components/BookingForm";
import { useAuth } from "@clerk/clerk-react";

const ListingDetail = () => {
    const { id } = useParams();
    const api = useApi();
    const { isSignedIn, userId } = useAuth();

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
                    <img
                        src={listing?.images?.[0] || "/placeholder-image.jpg"}
                        alt={listing?.title}
                        className="w-full h-96 object-cover rounded-lg mb-6"
                    />

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
                        </div>
                        <p className="text-gray-700 mb-6">
                            {listing?.description}
                        </p>

                        <Card>
                            <CardHeader>
                                <CardTitle>Owner Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">
                                    {listing?.owner?.firstName}{" "}
                                    {listing?.owner?.lastName}
                                </p>
                                <p className="text-gray-600">
                                    {listing?.owner?.email}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {!isSignedIn ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sign in to Book</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    You need to sign in to book this item.
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
                                    This is your listing. You cannot book your
                                    own items.
                                </p>
                                <Button className="w-full">Edit Listing</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <BookingForm listing={listing} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
