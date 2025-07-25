const bcrypt = require("bcrypt");

async function debugBcryptIssue() {
    console.log("🔍 Debugging bcrypt password comparison...");

    const password = "admin123";
    const staticHash =
        "$2b$10$bKmnaocvzjvDDGJsjXZmBOU7FiVG4H0UMOjkMIeRbktMZBQO2tRZe";

    console.log("Password to test:", password);
    console.log("Hash from admin.js:", staticHash);

    try {
        console.log("⏳ Starting bcrypt.compare...");
        const startTime = Date.now();

        const isValid = await bcrypt.compare(password, staticHash);

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ bcrypt.compare completed in ${duration}ms`);
        console.log(`Result: ${isValid ? "VALID" : "INVALID"}`);

        if (!isValid) {
            console.log("❌ Password doesn't match hash!");

            // Let's try creating a fresh hash
            console.log("🔄 Creating fresh hash for comparison...");
            const freshHash = await bcrypt.hash(password, 10);
            console.log("Fresh hash:", freshHash);

            const freshTest = await bcrypt.compare(password, freshHash);
            console.log("Fresh hash test:", freshTest ? "VALID" : "INVALID");
        }
    } catch (error) {
        console.error("❌ Error during bcrypt operations:", error);
    }
}

debugBcryptIssue();
