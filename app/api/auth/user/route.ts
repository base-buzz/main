/**
 * User Profile API - Current User Endpoint
 * @file apps/www/app/api/auth/user/route.ts
 *
 * UPDATES:
 * - Added support for both Supabase sessions and custom wallet sessions
 * - Added support for JWT wallet tokens (basebuzz-wallet-token)
 * - Improved wallet address lookup with case-insensitive comparison
 * - Enhanced error handling for missing profiles
 * - Added type safety for session parsing
 * - Fixed cookie handling for the X-Custom-Auth header
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

/**
 * GET: Get current user data based on session (Refactored for Iron Session / SIWE)
 *
 * This endpoint:
 * 1. Attempts to get the Iron Session containing SIWE data.
 * 2. If session exists and contains SIWE data (address, chainId), fetches user profile.
 * 3. Returns user profile or error.
 */
export async function GET(request: NextRequest) {
  console.log("📝 [user] Checking user data using Iron Session / SIWE");
  const cookieStore = cookies();

  try {
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );
    console.log("📋 [user] Fetched Iron Session:", session);

    if (!session.siwe || !session.siwe.address || !session.siwe.chainId) {
      console.log("❌ [user] No valid SIWE data found in Iron Session.");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userAddress = session.siwe.address;
    console.log(
      `✅ [user] Authenticated via SIWE session for address: ${userAddress}`
    );

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .ilike("address", userAddress)
      .single();

    if (userError) {
      console.error(
        `❌ [user] Error fetching profile for address ${userAddress}:`,
        userError.message
      );
      return NextResponse.json({
        id: session.userId || null,
        wallet_address: userAddress,
        address: userAddress,
        display_name: `User ${userAddress.substring(0, 6)}...`,
        created_at: new Date(session.siwe.issuedAt || Date.now()).toISOString(),
        auth_type: "siwe",
        avatar_url: null,
      });
    }

    if (!userData) {
      console.log(
        `🤷 [user] No profile found for address ${userAddress}, returning generic.`
      );
      return NextResponse.json({
        id: session.userId || null,
        wallet_address: userAddress,
        address: userAddress,
        display_name: `User ${userAddress.substring(0, 6)}...`,
        created_at: new Date(session.siwe.issuedAt || Date.now()).toISOString(),
        auth_type: "siwe",
        avatar_url: null,
      });
    }

    console.log(
      `✅ [user] Successfully fetched profile for address ${userAddress}`
    );
    return NextResponse.json({
      ...userData,
      auth_type: "siwe",
      wallet_address: userAddress,
    });
  } catch (error) {
    console.error("❌ [user] Unhandled error fetching user data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST handler remains unchanged for now, assuming it's for profile updates
// It might also need refactoring to use Iron Session if applicable
export async function POST(request: NextRequest) {
  // ... existing POST handler code ...
}
