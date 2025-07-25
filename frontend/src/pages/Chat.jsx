import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Chat = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const api = useApi();
    const { userId } = useAuth();
    const queryClient = useQueryClient();

    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const {
        data: chatData,
        isLoading,
        error,
    } = useQuery(
        ["chat", bookingId],
        async () => {
            const response = await api.get(`/chat/${bookingId}`);
            return response.data.chat;
        },
        {
            refetchInterval: 3000, // Poll for new messages every 3 seconds
        }
    );

    const sendMessageMutation = useMutation(
        async (content) => {
            const response = await api.post(`/chat/${bookingId}/messages`, {
                content,
            });
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["chat", bookingId]);
                setNewMessage("");
            },
        }
    );

    const completeBookingMutation = useMutation(
        async () => {
            const response = await api.patch(`/bookings/${bookingId}/status`, {
                status: "COMPLETED",
            });
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["bookings"]);
                navigate("/bookings");
            },
        }
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData?.messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };

    const handleCompleteBooking = () => {
        if (
            window.confirm(
                "Are you sure you want to mark this booking as completed?"
            )
        ) {
            completeBookingMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading chat: {error.message}
                </div>
            </div>
        );
    }

    const booking = chatData?.booking;
    const messages = chatData?.messages || [];
    const isOwner = booking?.listing?.owner?.id === userId;
    const otherParty = isOwner ? booking?.user : booking?.listing?.owner;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="outline" onClick={() => navigate("/bookings")}>
                    ← Back to Bookings
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Info */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">
                                    {booking?.listing?.title}
                                </h3>
                                <p className="text-gray-600">
                                    {booking?.listing?.location}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Badge className="bg-green-100 text-green-800">
                                    {booking?.status}
                                </Badge>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Rental Period
                                </p>
                                <p className="font-medium">
                                    {format(
                                        new Date(booking?.startDate),
                                        "MMM dd"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                        new Date(booking?.endDate),
                                        "MMM dd, yyyy"
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Cost
                                </p>
                                <p className="font-semibold text-green-600">
                                    ${booking?.totalCost}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    {isOwner ? "Renter" : "Owner"}
                                </p>
                                <p className="font-medium">
                                    {otherParty?.firstName}{" "}
                                    {otherParty?.lastName}
                                </p>
                            </div>

                            {booking?.status === "CONFIRMED" && (
                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={handleCompleteBooking}
                                        className="w-full"
                                        disabled={
                                            completeBookingMutation.isLoading
                                        }
                                    >
                                        Mark as Completed
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chat */}
                <div className="lg:col-span-2">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>
                                Chat with {otherParty?.firstName}{" "}
                                {otherParty?.lastName}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isMyMessage =
                                            message.userId === userId;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    isMyMessage
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        isMyMessage
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    <p>{message.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            isMyMessage
                                                                ? "text-blue-100"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {format(
                                                            new Date(
                                                                message.createdAt
                                                            ),
                                                            "HH:mm"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form
                                onSubmit={handleSendMessage}
                                className="flex gap-2"
                            >
                                <Input
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    placeholder="Type your message..."
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    disabled={
                                        !newMessage.trim() ||
                                        sendMessageMutation.isLoading
                                    }
                                >
                                    Send
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Chat;
