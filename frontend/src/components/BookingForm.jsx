import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/lib/api";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

const BookingForm = ({ listing }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const api = useApi();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createBookingMutation = useMutation(
        async (bookingData) => {
            const response = await api.post("/bookings", bookingData);
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["bookings"]);
                navigate("/bookings");
            },
            onError: (error) => {
                setError(
                    error.response?.data?.error || "Failed to create booking"
                );
            },
        }
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!startDate || !endDate) {
            setError("Please select both start and end dates");
            return;
        }

        if (startDate >= endDate) {
            setError("End date must be after start date");
            return;
        }

        const bookingData = {
            listingId: listing.id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            message: message.trim(),
        };

        createBookingMutation.mutate(bookingData);
    };

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        return differenceInDays(endDate, startDate);
    };

    const totalCost = calculateDays() * parseFloat(listing.price);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Book this item</CardTitle>
                <p className="text-2xl font-semibold text-green-600">
                    ${listing.price}/day
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            placeholderText="Select start date"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="Select end date"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Any special requests or questions?"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                        />
                    </div>

                    {startDate && endDate && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between">
                                <span>Duration:</span>
                                <span>{calculateDays()} days</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-green-600">
                                    ${totalCost.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            !startDate ||
                            !endDate ||
                            createBookingMutation.isLoading
                        }
                    >
                        {createBookingMutation.isLoading
                            ? "Sending Request..."
                            : "Request Booking"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default BookingForm;
