const http = require("http");

function testAdminLogin() {
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
    };

    console.log("🔐 Testing admin login...");
    console.log("Credentials:", {
        email: "admin@rentme.com",
        password: "admin123",
    });

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        let responseBody = "";
        res.on("data", (chunk) => {
            responseBody += chunk;
        });

        res.on("end", () => {
            console.log("Response Body:", responseBody);

            if (res.statusCode === 200) {
                console.log("✅ Admin login successful!");
                try {
                    const parsedResponse = JSON.parse(responseBody);
                    if (parsedResponse.token) {
                        console.log(
                            "🎫 Token received:",
                            parsedResponse.token.substring(0, 20) + "..."
                        );
                    }
                } catch (e) {
                    console.log("Could not parse response as JSON");
                }
            } else if (res.statusCode === 429) {
                console.log("⏰ Rate limited - wait a moment and try again");
            } else {
                console.log("❌ Login failed");
            }
        });
    });

    req.on("error", (e) => {
        console.error(`Request error: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

// Wait a bit then test
setTimeout(testAdminLogin, 2000);
