require("dotenv").config();

console.log("🔍 Checking Environment Variables...");
console.log(
    "CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME || "NOT SET"
);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY || "NOT SET");
console.log(
    "CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "***HIDDEN***" : "NOT SET"
);
console.log("MAX_FILE_SIZE:", process.env.MAX_FILE_SIZE || "NOT SET");

// Test Cloudinary configuration
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("\n🔧 Testing Cloudinary Configuration...");
try {
    console.log("Cloudinary config loaded:", {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? "***SET***" : "NOT SET",
        api_secret: cloudinary.config().api_secret ? "***SET***" : "NOT SET",
    });
} catch (error) {
    console.error("❌ Cloudinary configuration error:", error.message);
}
