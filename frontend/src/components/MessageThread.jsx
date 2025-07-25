import React, { useState } from "react";
import { useMutation } from "react-query";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MessageThread = ({ listing, onStartBooking }) => {
    const api = useApi();
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [newMessage, setNewMessage] = useState("");

    const createChatMutation = useMutation(
        async (messageContent) => {
            const response = await api.post(`/chat/listing/${listing.id}`, {
                content: messageContent,
            });
            return response.data;
        },
        {
            onSuccess: (data) => {
                setNewMessage("");
                // Navigate to the chats page with the new chat
                navigate(`/chats/${data.chat.id}`);
            },
            onError: (error) => {
                console.error("Error creating chat:", error);
                alert("Failed to send message. Please try again.");
            },
        }
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        createChatMutation.mutate(newMessage.trim());
    };

    const isOwner = userId === listing.owner.clerkId;

    // Don't show the message thread for owners - they'll see messages in their dashboard
    if (isOwner) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    Contact {listing.owner.firstName}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-gray-600 mb-4 text-sm">
                    Ask about availability, condition, pickup details, or any
                    other questions.
                </p>

                <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Hi ${listing.owner.firstName}, I'm interested in renting your ${listing.title}. Can you tell me more about...`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            !newMessage.trim() || createChatMutation.isLoading
                        }
                    >
                        {createChatMutation.isLoading
                            ? "Sending..."
                            : "Send Message"}
                    </Button>
                </form>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Your message will start a conversation that you can continue
                    in the Chats section
                </p>
            </CardContent>
        </Card>
    );
};

export default MessageThread;
