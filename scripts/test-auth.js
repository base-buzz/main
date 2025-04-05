// Test Authentication Script
// This script makes requests to the authentication endpoints
// to verify the state of both session types.

// Using ES Modules to match the project setup
import fetch from "node-fetch";

async function testAuth() {
  console.log("🔍 Testing Authentication Endpoints");
  console.log("==================================");

  // Define base URL (change this to your dev server)
  const BASE_URL = "http://localhost:3000";

  // Test the session endpoint
  console.log("\n📋 Testing Session Endpoint:");
  try {
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`);
    const sessionData = await sessionRes.json();
    console.log("Status:", sessionRes.status);
    console.log("Response:", JSON.stringify(sessionData, null, 2));
  } catch (error) {
    console.error("❌ Error testing session:", error.message);
  }

  // Test the user endpoint
  console.log("\n👤 Testing User Endpoint:");
  try {
    const userRes = await fetch(`${BASE_URL}/api/auth/user`);
    const userData = await userRes.json();
    console.log("Status:", userRes.status);
    console.log("Response:", JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error("❌ Error testing user:", error.message);
  }

  // Test wallet connect endpoint
  console.log("\n👛 Testing Wallet Connect Endpoint:");
  try {
    const connectRes = await fetch(`${BASE_URL}/api/auth/wallet/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: "0xTestWalletAddress123456789",
        message: "Test message",
        signature: "Test signature",
        chain_id: "1",
      }),
    });
    const connectData = await connectRes.json();
    console.log("Status:", connectRes.status);
    console.log("Response:", JSON.stringify(connectData, null, 2));
    console.log("Cookies:", connectRes.headers.get("set-cookie"));
  } catch (error) {
    console.error("❌ Error testing wallet connect:", error.message);
  }

  console.log("\n✅ Auth tests completed");
}

// Run the tests
testAuth().catch((error) => {
  console.error("❌ Test failed with error:", error);
  process.exit(1);
});
