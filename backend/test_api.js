const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

const BASE_URL = "http://localhost:3001/api";

async function testAuthentication() {
    console.log("🔐 Testing Authentication...");

    try {
        // Test with mock token
        const response = await fetch(`${BASE_URL}/listings`, {
            headers: {
                Authorization: "Bearer mock-token-cmdhg17wp0000ev8bac2ktfwd",
            },
        });

        if (response.ok) {
            console.log("✅ Authentication working");
            return true;
        } else {
            console.log(
                "❌ Authentication failed:",
                response.status,
                await response.text()
            );
            return false;
        }
    } catch (error) {
        console.error("❌ Authentication test error:", error.message);
        return false;
    }
}

async function testImageUpload() {
    console.log("📷 Testing Image Upload...");

    try {
        // Create a test file
        const testFileContent = "fake image data";
        fs.writeFileSync("/tmp/test-image.jpg", testFileContent);

        const form = new FormData();
        form.append("images", fs.createReadStream("/tmp/test-image.jpg"));

        const response = await fetch(`${BASE_URL}/listings/upload-images`, {
            method: "POST",
            headers: {
                Authorization: "Bearer mock-token-cmdhg17wp0000ev8bac2ktfwd",
                ...form.getHeaders(),
            },
            body: form,
        });

        const result = await response.text();
        console.log("Upload response:", response.status, result);

        if (response.ok) {
            console.log("✅ Image upload working");
            return true;
        } else {
            console.log("❌ Image upload failed");
            return false;
        }
    } catch (error) {
        console.error("❌ Image upload test error:", error.message);
        return false;
    } finally {
        // Clean up test file
        try {
            fs.unlinkSync("/tmp/test-image.jpg");
        } catch (e) {}
    }
}

async function runTests() {
    console.log("🧪 Running API Tests...\n");

    const authSuccess = await testAuthentication();
    console.log("");
    const uploadSuccess = await testImageUpload();

    console.log("\n📊 Test Results:");
    console.log("Authentication:", authSuccess ? "✅ PASS" : "❌ FAIL");
    console.log("Image Upload:", uploadSuccess ? "✅ PASS" : "❌ FAIL");
}

runTests();
