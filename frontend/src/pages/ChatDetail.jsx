import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw } from "lucide-react";
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
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            </div>

                            {/* Listing & User Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold">
                                            {chat.listing.title}
                                        </h1>
                                        <p className="text-gray-600 mb-2">
                                            {chat.listing.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="font-semibold text-green-600">
                                                ${chat.listing.price}/day
                                            </span>
                                            <span>
                                                📍 {chat.listing.location}
                                            </span>
                                            <Badge variant="outline">
                                                {chat.listing.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <Badge
                                            variant={
                                                isOwner
                                                    ? "default"
                                                    : "secondary"
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
            <Card className="h-96 flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        Conversation with {otherUser.firstName}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-4">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {chat.messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            chat.messages.map((message) => {
                                const isCurrentUser = message.userId === userId;
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            isCurrentUser
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                isCurrentUser
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 text-gray-900"
                                            }`}
                                        >
                                            <p className="text-sm">
                                                {message.content}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    isCurrentUser
                                                        ? "text-blue-100"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {format(
                                                    new Date(message.createdAt),
                                                    "MMM d, h:mm a"
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
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message ${otherUser.firstName}...`}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={
                                !newMessage.trim() ||
                                sendMessageMutation.isLoading
                            }
                        >
                            {sendMessageMutation.isLoading
                                ? "Sending..."
                                : "Send"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatDetail;
