const axios = require("axios");

async function testAdminLogin() {
    try {
        console.log("🔐 Testing admin login via API...");

        const loginData = {
            email: "admin@rentme.com",
            password: "admin123",
        };

        console.log("Attempting login with:", loginData);

        const response = await axios.post(
            "http://localhost:3001/api/admin/login",
            loginData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 5000,
            }
        );

        console.log("✅ Login successful!");
        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(response.data, null, 2));

        // Test the token by calling a protected admin endpoint
        if (response.data.token) {
            console.log("\n🔍 Testing admin token...");
            const verifyResponse = await axios.get(
                "http://localhost:3001/api/admin/verify",
                {
                    headers: {
                        Authorization: `Bearer ${response.data.token}`,
                    },
                }
            );
            console.log("✅ Token verification successful!");
            console.log(
                "Verify response:",
                JSON.stringify(verifyResponse.data, null, 2)
            );
        }
    } catch (error) {
        console.error("❌ Login failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Response:", error.response.data);
        } else if (error.request) {
            console.error("No response received:", error.message);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testAdminLogin();
