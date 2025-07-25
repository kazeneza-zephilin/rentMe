const http = require("http");

function testAdminLogin() {
    console.log("🔐 Testing admin login with timeout...");

    const postData = JSON.stringify({
        email: "admin@rentme.com",
        password: "admin123",
    });

    const options = {
        hostname: "localhost",
        port: 3001,
        path: "/api/admin/login",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 10000, // 10 second timeout
    };

    console.log(
        "📤 Sending request to:",
        `http://localhost:3001/api/admin/login`
    );
    console.log("📋 Request data:", {
        email: "admin@rentme.com",
        password: "admin123",
    });

    const req = http.request(options, (res) => {
        console.log(`✅ Response received - Status: ${res.statusCode}`);
        console.log(`📊 Headers:`, res.headers);

        let responseBody = "";
        res.on("data", (chunk) => {
            responseBody += chunk;
        });

        res.on("end", () => {
            console.log("📄 Response Body:", responseBody);

            if (res.statusCode === 200) {
                console.log("🎉 Admin login successful!");
                try {
                    const parsedResponse = JSON.parse(responseBody);
                    if (parsedResponse.token) {
                        console.log(
                            "🎫 JWT Token received:",
                            parsedResponse.token.substring(0, 50) + "..."
                        );
                    }
                    if (parsedResponse.admin) {
                        console.log("👤 Admin data:", parsedResponse.admin);
                    }
                } catch (e) {
                    console.log(
                        "⚠️ Could not parse response as JSON:",
                        e.message
                    );
                }
            } else if (res.statusCode === 429) {
                console.log("⏰ Rate limited - too many requests");
            } else if (res.statusCode === 401) {
                console.log("🔒 Authentication failed - invalid credentials");
            } else {
                console.log("❌ Login failed with status:", res.statusCode);
            }
        });
    });

    req.on("error", (e) => {
        console.error(`❌ Request error: ${e.message}`);
        console.error(
            "This could indicate the server is not running or not accessible"
        );
    });

    req.on("timeout", () => {
        console.error("⏰ Request timed out - server is hanging");
        req.destroy();
    });

    req.setTimeout(10000);
    req.write(postData);
    req.end();

    console.log("⏳ Request sent, waiting for response...");
}

// Test after a short delay
setTimeout(() => {
    console.log("🚀 Starting admin login test...");
    testAdminLogin();
}, 2000);
