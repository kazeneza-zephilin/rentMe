// Development User Switcher
// Run this in the browser console to switch between test users

// Available test users
const testUsers = {
    owner: {
        id: "cmdinsvd3000qxpfygdolemwx",
        name: "Owner User",
        clerkId: "user_30EUPWEgnLQuBnzt2EvJFksWuxb",
        role: "Owns the camera listing",
    },
    renter: {
        id: "cmdinswio000sxpfyuujr2x70",
        name: "Renter User",
        clerkId: "user_30Jhm8uADvfttBcjm5C3IbWxCmL",
        role: "Interested in renting",
    },
};

// Function to switch user (run this in console)
function switchToUser(userType) {
    const user = testUsers[userType];
    if (!user) {
        console.error('Invalid user type. Use "owner" or "renter"');
        return;
    }

    localStorage.setItem("devUserId", user.id);
    console.log(`Switched to ${user.name} (${user.role})`);
    console.log("Reload the page to apply changes");

    // Optionally auto-reload
    // window.location.reload();
}

// Helper functions
window.switchToOwner = () => switchToUser("owner");
window.switchToRenter = () => switchToUser("renter");
window.showCurrentUser = () => {
    const currentId = localStorage.getItem("devUserId");
    const currentUser = Object.values(testUsers).find(
        (u) => u.id === currentId
    );
    if (currentUser) {
        console.log(`Current user: ${currentUser.name} (${currentUser.role})`);
    } else {
        console.log("No user selected, using default");
    }
};

console.log("Development User Switcher loaded!");
console.log("Available commands:");
console.log("  switchToOwner() - Switch to owner user");
console.log("  switchToRenter() - Switch to renter user");
console.log("  showCurrentUser() - Show current user");
console.log("");
window.showCurrentUser();
