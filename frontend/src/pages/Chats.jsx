import React from "react";
import { useQuery } from "react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Chats = () => {
    const api = useApi();
    const { userId, isSignedIn } = useAuth();

    const {
        data: chatsData,
        isLoading,
        error,
    } = useQuery(
        ["chats"],
        async () => {
            const response = await api.get("/chat");
            return response.data;
        },
        {
            enabled: isSignedIn,
        }
    );

    if (!isSignedIn) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                    <p className="text-gray-600">
                        You need to sign in to view your chats.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-200 rounded mb-4"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Error loading chats: {error.message}
                </div>
            </div>
        );
    }

    const chats = chatsData?.chats || [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Your Chats</h1>
                <p className="text-gray-600 mt-2">
                    Conversations about your listings and rental inquiries
                </p>
            </div>

            {chats.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="text-gray-500">
                            <svg
                                className="mx-auto h-12 w-12 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.465c-1.226.65-2.666.65-3.894 0L2 19l1.465-2.2A8.959 8.959 0 011 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">
                                No chats yet
                            </h3>
                            <p className="text-sm">
                                When you message owners about listings or
                                receive messages about your listings, they'll
                                appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {chats.map((chat) => {
                        const isOwner = chat.ownerId === userId;
                        const otherUser = isOwner ? chat.renter : chat.owner;
                        const lastMessage = chat.messages[0]; // Latest message (ordered desc in API)

                        return (
                            <Link
                                key={chat.id}
                                to={`/chats/${chat.id}`}
                                className="block"
                            >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Listing Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={
                                                        chat.listing
                                                            .images[0] ||
                                                        "/placeholder-image.jpg"
                                                    }
                                                    alt={chat.listing.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            </div>

                                            {/* Chat Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg truncate">
                                                            {chat.listing.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {isOwner
                                                                ? "Inquiry from"
                                                                : "Chat with"}{" "}
                                                            {
                                                                otherUser.firstName
                                                            }{" "}
                                                            {otherUser.lastName}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span>
                                                                $
                                                                {
                                                                    chat.listing
                                                                        .price
                                                                }
                                                                /day
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {
                                                                    chat.listing
                                                                        .location
                                                                }
                                                            </span>
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
                                                                ? "Owner"
                                                                : "Renter"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Last Message */}
                                                {lastMessage && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-sm text-gray-700 truncate">
                                                            <span className="font-medium">
                                                                {lastMessage.sender ===
                                                                "owner"
                                                                    ? "Owner: "
                                                                    : "Renter: "}
                                                            </span>
                                                            {
                                                                lastMessage.content
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {format(
                                                                new Date(
                                                                    lastMessage.createdAt
                                                                ),
                                                                "MMM d, h:mm a"
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Chats;
