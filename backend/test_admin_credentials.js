const bcrypt = require("bcrypt");

async function testAdminCredentials() {
    console.log("🔐 Testing admin login credentials...");

    // These are the default values from the admin.js file
    const ADMIN_EMAIL = "admin@rentme.com";
    const defaultPassword = "admin123";
    const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10);

    console.log("Expected credentials:");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${defaultPassword}`);
    console.log(`Password Hash: ${ADMIN_PASSWORD_HASH}`);

    // Test password comparison
    const isValidPassword = await bcrypt.compare(
        defaultPassword,
        ADMIN_PASSWORD_HASH
    );
    console.log(
        `\nPassword validation test: ${isValidPassword ? "✅ PASS" : "❌ FAIL"}`
    );

    // Test with wrong password
    const isWrongPassword = await bcrypt.compare(
        "wrongpassword",
        ADMIN_PASSWORD_HASH
    );
    console.log(
        `Wrong password test: ${isWrongPassword ? "❌ FAIL" : "✅ PASS"}`
    );

    // Create a fresh hash for admin123 to verify our understanding
    const freshHash = await bcrypt.hash("admin123", 10);
    const freshTest = await bcrypt.compare("admin123", freshHash);
    console.log(`\nFresh hash test: ${freshTest ? "✅ PASS" : "❌ FAIL"}`);

    console.log("\n📋 Summary:");
    console.log("If you're having login issues, try these credentials:");
    console.log(`Email: admin@rentme.com`);
    console.log(`Password: admin123`);
}

testAdminCredentials().catch(console.error);
