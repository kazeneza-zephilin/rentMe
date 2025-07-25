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
import { differenceInDays, format } from "date-fns";

const AirbnbBookingForm = ({ listing, onClose }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState(1); // 1: dates, 2: details, 3: confirmation

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

    const dailyRate = parseFloat(listing.price);
    const days = calculateDays();
    const subtotal = days * dailyRate;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const totalCost = subtotal + serviceFee;

    const nextStep = () => {
        if (step === 1 && (!startDate || !endDate)) {
            setError("Please select both dates");
            return;
        }
        if (step === 1 && startDate >= endDate) {
            setError("End date must be after start date");
            return;
        }
        setError("");
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
        setError("");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl">
                        {step === 1 && "Select dates"}
                        {step === 2 && "Add details"}
                        {step === 3 && "Confirm booking"}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Date Selection */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-semibold">
                                        CHECK-IN
                                    </Label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={setStartDate}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={new Date()}
                                        placeholderText="Add date"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        dateFormat="MMM d, yyyy"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">
                                        CHECKOUT
                                    </Label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={setEndDate}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        placeholderText="Add date"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        dateFormat="MMM d, yyyy"
                                    />
                                </div>
                            </div>

                            {startDate && endDate && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">
                                            ${dailyRate} × {days} day
                                            {days !== 1 ? "s" : ""}
                                        </span>
                                        <span className="text-lg">
                                            ${subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Dates</span>
                                    <span>
                                        {format(startDate, "MMM d")} -{" "}
                                        {format(endDate, "MMM d, yyyy")}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Duration</span>
                                    <span>
                                        {days} day{days !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="message"
                                    className="text-sm font-semibold"
                                >
                                    Message to owner (optional)
                                </Label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell the owner about your rental plans..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <h3 className="font-semibold">
                                    Booking summary
                                </h3>

                                <div className="flex justify-between">
                                    <span>Dates</span>
                                    <span>
                                        {format(startDate, "MMM d")} -{" "}
                                        {format(endDate, "MMM d, yyyy")}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>
                                        ${dailyRate} × {days} day
                                        {days !== 1 ? "s" : ""}
                                    </span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Service fee</span>
                                    <span>${serviceFee.toFixed(2)}</span>
                                </div>

                                <hr className="border-gray-300" />

                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>${totalCost.toFixed(2)}</span>
                                </div>
                            </div>

                            {message && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">
                                            Your message:
                                        </span>{" "}
                                        {message}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                        {step > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                className="flex-1"
                            >
                                Back
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex-1"
                                disabled={
                                    step === 1 && (!startDate || !endDate)
                                }
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1"
                                disabled={createBookingMutation.isLoading}
                            >
                                {createBookingMutation.isLoading
                                    ? "Sending Request..."
                                    : "Request Booking"}
                            </Button>
                        )}
                    </div>

                    {step === 1 && (
                        <p className="text-xs text-gray-500 text-center">
                            You won't be charged yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AirbnbBookingForm;
