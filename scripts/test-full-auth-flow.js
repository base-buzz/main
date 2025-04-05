#!/usr/bin/env node

/**
 * Full Authentication Flow Test Script
 *
 * This script tests the entire authentication flow including:
 * 1. Wallet connection
 * 2. Authentication
 * 3. User profile retrieval
 * 4. Session management
 */

const TEST_WALLET = "0x720F67E23D4AAE122f33cC11352063166A65377A";
const BASE_URL = "http://localhost:3333";

// Storage for cookies
let cookies = [];

// Helper to fetch with cookies
async function fetchWithCookies(url, options = {}) {
  const opts = { ...options };

  // Add cookies if we have them
  if (cookies.length > 0) {
    opts.headers = {
      ...opts.headers,
      Cookie: cookies.join("; "),
    };
  }

  const response = await fetch(url, opts);

  // Store set-cookie headers for subsequent requests
  const setCookieHeader = response.headers.get("set-cookie");
  if (setCookieHeader) {
    cookies = setCookieHeader
      .split(",")
      .map((cookie) => cookie.split(";")[0].trim());
    console.log("Cookies received:", cookies);
  }

  return response;
}

async function testFullAuthFlow() {
  console.log("🔄 Starting full authentication flow test...");
  console.log(`Using wallet address: ${TEST_WALLET}`);
  console.log("-".repeat(50));

  try {
    // 1. Check database for wallet directly (using our RPC function)
    console.log("\n1️⃣ Checking database for wallet...");
    const dbCheckResponse = await fetchWithCookies(
      `${BASE_URL}/api/db/check-wallet?address=${TEST_WALLET}`,
    );

    if (dbCheckResponse.ok) {
      const dbData = await dbCheckResponse.json();
      console.log("✅ Database check successful");
      console.log("📊 Data:", JSON.stringify(dbData, null, 2));
    } else {
      console.log("❌ Database check failed");
      console.log(
        `Status: ${dbCheckResponse.status} ${dbCheckResponse.statusText}`,
      );
    }
    console.log("-".repeat(50));

    // 2. Test the user API
    console.log("\n2️⃣ Testing user API endpoint...");
    const userResponse = await fetchWithCookies(
      `${BASE_URL}/api/users?address=${TEST_WALLET}`,
    );

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log("✅ User API successful");
      console.log("👤 User data:", JSON.stringify(userData, null, 2));
    } else {
      console.log("❌ User API failed");
      try {
        const errorData = await userResponse.json();
        console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        console.log(
          `Status: ${userResponse.status} ${userResponse.statusText}`,
        );
      }
    }
    console.log("-".repeat(50));

    // 3. Test wallet connect endpoint
    console.log("\n3️⃣ Testing wallet connect endpoint...");
    const connectResponse = await fetchWithCookies(
      `${BASE_URL}/api/auth/wallet/connect`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: TEST_WALLET }),
      },
    );

    let connectData;
    if (connectResponse.ok) {
      connectData = await connectResponse.json();
      console.log("✅ Wallet connect successful");
      console.log("🧑 User ID:", connectData.user?.id);
      console.log("🔑 Session:", connectData.session ? "Present" : "Missing");
      console.log("📝 Message:", connectData.message);
    } else {
      console.log("❌ Wallet connect failed");
      try {
        const errorData = await connectResponse.json();
        console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        console.log(
          `Status: ${connectResponse.status} ${connectResponse.statusText}`,
        );
      }
    }
    console.log("-".repeat(50));

    // 4. Test auth session
    console.log("\n4️⃣ Testing auth session...");
    const sessionResponse = await fetchWithCookies(
      `${BASE_URL}/api/auth/session`,
    );

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log("✅ Session check successful");
      console.log("📊 Session data:", JSON.stringify(sessionData, null, 2));
    } else {
      console.log("❌ Session check failed");
      try {
        const errorData = await sessionResponse.json();
        console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        console.log(
          `Status: ${sessionResponse.status} ${sessionResponse.statusText}`,
        );
      }
    }
    console.log("-".repeat(50));

    // 5. Test user profile
    console.log("\n5️⃣ Testing user profile endpoint...");
    const profileResponse = await fetchWithCookies(`${BASE_URL}/api/auth/user`);

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ Profile fetch successful");
      console.log("👤 User profile:", JSON.stringify(profileData, null, 2));
    } else {
      console.log("❌ Profile fetch failed");
      try {
        const errorData = await profileResponse.json();
        console.log(`Error: ${JSON.stringify(errorData, null, 2)}`);
      } catch (e) {
        console.log(
          `Status: ${profileResponse.status} ${profileResponse.statusText}`,
        );
      }
    }
    console.log("-".repeat(50));

    console.log("\n✨ Test completed");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Create the check-wallet API endpoint to help with debugging
async function createCheckWalletEndpoint() {
  console.log("Creating check-wallet API endpoint...");

  // Implementation would go here in a real scenario

  console.log("Endpoint creation skipped (this would be a separate step)");
  console.log("-".repeat(50));
}

// Main execution
(async () => {
  try {
    // First create the debugging API if needed
    await createCheckWalletEndpoint();

    // Then run the main test
    await testFullAuthFlow();
  } catch (error) {
    console.error("Error running tests:", error);
  }
})();
