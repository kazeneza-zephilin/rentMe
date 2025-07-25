import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DevUserSwitcher = () => {
    const [currentUserId, setCurrentUserId] = useState(
        localStorage.getItem("devMockUserId") || "cmdinsvd3000qxpfygdolemwx"
    );

    const mockUsers = [
        {
            id: "cmdinsvd3000qxpfygdolemwx",
            name: "Owner User",
            clerkId: "user_30EUPWEgnLQuBnzt2EvJFksWuxb",
            role: "Owner of the camera listing",
        },
        {
            id: "cmdinswio000sxpfyuujr2x70",
            name: "Renter User",
            clerkId: "user_30Jhm8uADvfttBcjm5C3IbWxCmL",
            role: "Interested in renting items",
        },
    ];

    const switchUser = (userId) => {
        localStorage.setItem("devMockUserId", userId);
        setCurrentUserId(userId);
        // Reload the page to apply the new user context
        window.location.reload();
    };

    const currentUser = mockUsers.find((user) => user.id === currentUserId);

    return (
        <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800">
                    🔧 Development User Switcher
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-yellow-700 mb-3">
                    Current: <strong>{currentUser?.name}</strong> (
                    {currentUser?.role})
                </div>
                <div className="space-y-2">
                    {mockUsers.map((user) => (
                        <Button
                            key={user.id}
                            onClick={() => switchUser(user.id)}
                            variant={
                                user.id === currentUserId
                                    ? "default"
                                    : "outline"
                            }
                            className="w-full text-xs h-8"
                            size="sm"
                        >
                            {user.name}
                            <br />
                            <span className="text-xs opacity-70">
                                {user.role}
                            </span>
                        </Button>
                    ))}
                </div>
                <div className="text-xs text-yellow-600 mt-2">
                    Switch users to test different permissions
                </div>
            </CardContent>
        </Card>
    );
};

export default DevUserSwitcher;
