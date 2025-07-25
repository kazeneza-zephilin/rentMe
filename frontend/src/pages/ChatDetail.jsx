import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Calendar, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const ChatDetail = () => {
    const { chatId } = useParams();
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
        ["chat", chatId],
        async () => {
            console.log("Fetching chat:", chatId);
            try {
                const response = await api.get(`/chat/${chatId}`);
                console.log("Chat fetch successful:", response.data);
                return response.data;
            } catch (error) {
                console.error("Chat fetch failed:", {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    config: error.config,
                });
                throw error;
            }
        },
        {
            retry: false, // Disable retries to see the actual error
            refetchOnWindowFocus: false, // Don't refetch when window gains focus
            // Remove the automatic refresh interval to stop constant refreshing
        }
    );

    const sendMessageMutation = useMutation(
        async (content) => {
            const response = await api.post(`/chat/${chatId}/messages`, {
                content,
            });
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["chat", chatId]);
                setNewMessage("");
            },
        }
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData?.chat?.messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage.trim());
        }
    };

    const handleRefresh = () => {
        console.log("Manual refresh triggered");
        queryClient.invalidateQueries(["chat", chatId]);
    };

    const handleBookListing = () => {
        // Navigate to listing detail page with booking auto-open
        navigate(`/listings/${chat.listing.id}?book=true`);
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
        console.error("Chat fetch error:", error);
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        Error loading chat: {error.message}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                        Chat ID: {chatId}
                    </div>
                    <Button
                        onClick={() => navigate("/chats")}
                        variant="outline"
                    >
                        Back to Chats
                    </Button>
                </div>
            </div>
        );
    }

    if (!chatData?.chat) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Chat not found</h1>
                    <Button onClick={() => navigate("/chats")}>
                        Back to Chats
                    </Button>
                </div>
            </div>
        );
    }

    const chat = chatData.chat;
    const isOwner = chat.ownerId === userId;
    const otherUser = isOwner ? chat.renter : chat.owner;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => navigate("/chats")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Chats
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        size="sm"
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                                isLoading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            {/* Listing Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={
                                        chat.listing.images[0] ||
                                        "/placeholder-image.jpg"
                                    }
                                    alt={chat.listing.title}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            </div>

                            {/* Listing & User Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h1 className="text-xl font-bold">
                                            {chat.listing.title}
                                        </h1>
                                        <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                                            {chat.listing.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <span className="font-semibold text-green-600 text-lg">
                                                ${chat.listing.price}/day
                                            </span>
                                            <span>
                                                📍 {chat.listing.location}
                                            </span>
                                            <Badge variant="outline">
                                                {chat.listing.category}
                                            </Badge>
                                        </div>

                                        {/* CTA Buttons - Book Now for renters, View Details for owners */}
                                        {!isOwner ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleBookListing}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                                                    size="sm"
                                                >
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Book Now
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        navigate(
                                                            `/listings/${chat.listing.id}`
                                                        )
                                                    }
                                                    variant="outline"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                    size="sm"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() =>
                                                        navigate(
                                                            `/listings/${chat.listing.id}`
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right ml-4">
                                        <Badge
                                            variant={
                                                isOwner ? "default" : "blue"
                                            }
                                            className={
                                                !isOwner
                                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                                    : ""
                                            }
                                        >
                                            {isOwner
                                                ? "You are the Owner"
                                                : "You are Inquiring"}
                                        </Badge>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isOwner
                                                ? "Inquiry from"
                                                : "Chat with"}{" "}
                                            {otherUser.firstName}{" "}
                                            {otherUser.lastName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chat Messages */}
            <Card className="flex flex-col" style={{ height: "500px" }}>
                <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-lg flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Conversation with {otherUser.firstName}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    {/* Messages Area with improved scrolling */}
                    <div
                        className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scroll-smooth"
                        style={{
                            maxHeight: "400px",
                            scrollBehavior: "smooth",
                        }}
                    >
                        {chat.messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            chat.messages.map((message, index) => {
                                const isCurrentUser = message.userId === userId;
                                const previousMessage =
                                    chat.messages[index - 1];
                                const showDate =
                                    !previousMessage ||
                                    new Date(
                                        message.createdAt
                                    ).toDateString() !==
                                        new Date(
                                            previousMessage.createdAt
                                        ).toDateString();

                                return (
                                    <div key={message.id}>
                                        {/* Date separator */}
                                        {showDate && (
                                            <div className="text-center my-4">
                                                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                    {format(
                                                        new Date(
                                                            message.createdAt
                                                        ),
                                                        "MMMM d, yyyy"
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            className={`flex ${
                                                isCurrentUser
                                                    ? "justify-end"
                                                    : "justify-start"
                                            } mb-2`}
                                        >
                                            <div
                                                className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                                    isCurrentUser
                                                        ? "bg-blue-500 text-white rounded-br-md"
                                                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                                                }`}
                                            >
                                                {/* Message content */}
                                                <p className="text-sm leading-relaxed break-words">
                                                    {message.content}
                                                </p>

                                                {/* Timestamp */}
                                                <div
                                                    className={`flex items-center justify-end mt-1 ${
                                                        isCurrentUser
                                                            ? "text-blue-100"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    <span className="text-xs">
                                                        {format(
                                                            new Date(
                                                                message.createdAt
                                                            ),
                                                            "h:mm a"
                                                        )}
                                                    </span>
                                                    {/* Delivery indicator for sent messages */}
                                                    {isCurrentUser && (
                                                        <span className="ml-1 text-xs">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Message tail */}
                                                <div
                                                    className={`absolute bottom-0 w-0 h-0 ${
                                                        isCurrentUser
                                                            ? "right-0 border-l-8 border-l-blue-500 border-b-8 border-b-transparent"
                                                            : "left-0 border-r-8 border-r-white border-b-8 border-b-transparent"
                                                    }`}
                                                    style={{
                                                        transform: isCurrentUser
                                                            ? "translateX(0px) translateY(8px)"
                                                            : "translateX(0px) translateY(8px)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex-shrink-0 p-4 border-t bg-gray-50">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex gap-3"
                        >
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${otherUser.firstName}...`}
                                className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                maxLength={500}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    !newMessage.trim() ||
                                    sendMessageMutation.isLoading
                                }
                                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6"
                            >
                                {sendMessageMutation.isLoading ? "..." : "Send"}
                            </Button>
                        </form>

                        {/* Character counter */}
                        <div className="text-xs text-gray-500 mt-1 text-right">
                            {newMessage.length}/500
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatDetail;
