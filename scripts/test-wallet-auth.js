#!/usr/bin/env node

/**
 * Wallet Authentication Test Script
 *
 * This script tests the simplified wallet authentication flow
 * without requiring SIWE signature verification.
 */

const TEST_WALLET = "0x720F67E23D4AAE122f33cC11352063166A65377A";
const BASE_URL = "http://localhost:3333";

async function testWalletAuth() {
  console.log("🔄 Starting wallet authentication test...");
  console.log(`Using wallet address: ${TEST_WALLET}`);

  try {
    // 1. Check if the wallet exists in the system
    console.log("\n1️⃣ Checking if wallet exists...");
    const userResponse = await fetch(
      `${BASE_URL}/api/users?address=${TEST_WALLET}`,
    );

    const userExists = userResponse.ok;

    if (userExists) {
      const userData = await userResponse.json();
      console.log(`✅ Found user: ${userData.display_name || userData.id}`);
    } else {
      console.log("❌ User not found");
    }

    // 2. Test the wallet connect endpoint
    console.log("\n2️⃣ Testing wallet connect endpoint...");
    const connectResponse = await fetch(`${BASE_URL}/api/auth/wallet/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: TEST_WALLET }),
    });

    if (connectResponse.ok) {
      const connectData = await connectResponse.json();
      console.log("✅ Wallet connect successful");
      console.log(`🧑 User ID: ${connectData.user?.id}`);
      console.log(`🔑 Session exists: ${!!connectData.session}`);
    } else {
      console.log("❌ Wallet connect failed");
      try {
        const errorData = await connectResponse.json();
        console.log(`Error: ${errorData.error || "Unknown error"}`);
      } catch (e) {
        console.log(
          `Status: ${connectResponse.status} ${connectResponse.statusText}`,
        );
      }
    }

    // 3. Test fetching the user profile with session
    console.log("\n3️⃣ Testing user profile endpoint...");
    const profileResponse = await fetch(`${BASE_URL}/api/auth/user`, {
      headers: {
        Cookie: connectResponse.headers.get("set-cookie") || "",
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ Profile fetch successful");
      console.log(`👤 User: ${profileData.display_name || profileData.id}`);
      console.log(`💼 Wallet: ${profileData.address}`);
    } else {
      console.log("❌ Profile fetch failed");
      try {
        const errorData = await profileResponse.json();
        console.log(`Error: ${errorData.error || "Unknown error"}`);
      } catch (e) {
        console.log(
          `Status: ${profileResponse.status} ${profileResponse.statusText}`,
        );
      }
    }

    console.log("\n✨ Test completed");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

testWalletAuth().catch(console.error);
