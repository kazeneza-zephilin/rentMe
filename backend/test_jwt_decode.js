// Test JWT token decoding
function testTokenDecoding() {
    // Example Clerk JWT token format (this is what a real token might look like)
    const exampleToken =
        "eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yZkpDcHBjcjFOZ1FVRGJiSUdaM2VEbVhJRlYiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLWZyb250ZW5kLmNsZXJrLmFjY291bnRzLmRldiIsImV4cCI6MTcyMTkwMDQ4NSwiaWF0IjoxNzIxOTAwNDI1LCJpc3MiOiJodHRwczovL2NsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTcyMTkwMDQxNSwic2lkIjoic2Vzc18yZkpDcHFNb1k1Q0JlNGpaQlhZYWJhb3pIcHMiLCJzdWIiOiJ1c2VyXzJmSkNwcDNEb3hqM2dFWDl2TnQ3UHFwT3VqeSJ9";

    try {
        const parts = exampleToken.split(".");
        console.log("Token parts:", parts.length);

        if (parts.length === 3) {
            // Try base64 decode
            try {
                const payload = JSON.parse(
                    Buffer.from(parts[1], "base64").toString()
                );
                console.log("Base64 decode success:", payload);
            } catch (base64Error) {
                console.log("Base64 decode failed:", base64Error.message);

                // Try base64url decode
                try {
                    const payload = JSON.parse(
                        Buffer.from(parts[1], "base64url").toString()
                    );
                    console.log("Base64url decode success:", payload);
                } catch (base64urlError) {
                    console.log(
                        "Base64url decode failed:",
                        base64urlError.message
                    );
                }
            }
        }
    } catch (error) {
        console.error("Token decode error:", error);
    }
}

testTokenDecoding();
