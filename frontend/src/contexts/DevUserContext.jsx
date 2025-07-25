import React, { createContext, useContext, useState } from "react";

// Development user context for switching between users
const DevUserContext = createContext();

export const useDevUser = () => {
    const context = useContext(DevUserContext);
    if (!context) {
        throw new Error("useDevUser must be used within a DevUserProvider");
    }
    return context;
};

export const DevUserProvider = ({ children }) => {
    // Available mock users from the database
    const mockUsers = [
        {
            id: "cmdinsvd3000qxpfygdolemwx",
            name: "Owner User",
            clerkId: "user_30EUPWEgnLQuBnzt2EvJFksWuxb",
            email: "user-user_30EUPWEgnLQuBnzt2EvJFksWuxb@clerk.local",
        },
        {
            id: "cmdinswio000sxpfyuujr2x70",
            name: "Renter User",
            clerkId: "user_30Jhm8uADvfttBcjm5C3IbWxCmL",
            email: "user-user_30Jhm8uADvfttBcjm5C3IbWxCmL@clerk.local",
        },
    ];

    const [currentMockUser, setCurrentMockUser] = useState(mockUsers[0]);

    return (
        <DevUserContext.Provider
            value={{
                mockUsers,
                currentMockUser,
                setCurrentMockUser,
            }}
        >
            {children}
        </DevUserContext.Provider>
    );
};
