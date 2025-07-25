import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
    const api = useApi();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        data: bookingsData,
        isLoading,
        error,
    } = useQuery(["bookings"], async () => {
        const response = await api.get("/bookings");
        return response.data;
    });

    const updateStatusMutation = useMutation(
        async ({ bookingId, status }) => {
            const response = await api.patch(`/bookings/${bookingId}/status`, {
                status,
            });
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["bookings"]);
            },
        }
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "CONFIRMED":
                return "bg-green-100 text-green-800";
            case "COMPLETED":
                return "bg-blue-100 text-blue-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleChat = (bookingId) => {
        navigate(`/chat/${bookingId}`);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading bookings: {error.message}
                </div>
            </div>
        );
    }

    const bookings = bookingsData?.bookings || [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500 mb-4">No bookings yet</p>
                        <Button onClick={() => navigate("/listings")}>
                            Browse Items
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">
                                            {booking.listing.title}
                                        </CardTitle>
                                        <p className="text-gray-600">
                                            Owner:{" "}
                                            {booking.listing.owner.firstName}{" "}
                                            {booking.listing.owner.lastName}
                                        </p>
                                    </div>
                                    <Badge
                                        className={getStatusColor(
                                            booking.status
                                        )}
                                    >
                                        {booking.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Start Date
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(booking.startDate),
                                                "MMM dd, yyyy"
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            End Date
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(booking.endDate),
                                                "MMM dd, yyyy"
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Total Cost
                                        </p>
                                        <p className="font-medium text-green-600">
                                            ${booking.totalCost}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Booked On
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(booking.createdAt),
                                                "MMM dd, yyyy"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {booking.message && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">
                                            Message
                                        </p>
                                        <p className="text-gray-700">
                                            {booking.message}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {booking.status === "CONFIRMED" && (
                                        <Button
                                            onClick={() =>
                                                handleChat(booking.id)
                                            }
                                            variant="outline"
                                        >
                                            💬 Chat with Owner
                                        </Button>
                                    )}

                                    {booking.status === "PENDING" && (
                                        <Button
                                            onClick={() =>
                                                updateStatusMutation.mutate({
                                                    bookingId: booking.id,
                                                    status: "CANCELLED",
                                                })
                                            }
                                            variant="outline"
                                            disabled={
                                                updateStatusMutation.isLoading
                                            }
                                        >
                                            Cancel Request
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;
