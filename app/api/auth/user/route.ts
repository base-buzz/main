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
import jwt from "jsonwebtoken";

/**
 * Custom wallet session interface
 */
interface CustomWalletSession {
  user_id: string;
  wallet_address: string;
  created_at: string;
  auth_type: string;
  timestamp: number;
  debug_info?: any;
}

/**
 * JWT wallet token interface
 */
interface WalletJwtPayload {
  id: string;
  wallet: string;
  auth_method: string;
  iat: number;
  exp: number;
}

/**
 * GET: Get current user data based on session
 *
 * This endpoint:
 * 1. Checks if there is an active Supabase session or custom wallet session
 * 2. Fetches the user data from the auth.users table
 * 3. Fetches additional profile data from the public.users table
 * 4. Combines and returns the data
 */
export async function GET(request: NextRequest) {
  console.log("📝 [user] Checking user data");

  // Log raw cookie headers for debugging
  const cookieHeader = request.headers.get("cookie");
  const customAuthHeader = request.headers.get("x-custom-auth");

  console.log(`📋 [user] Raw cookie header: ${cookieHeader || "none"}`);
  console.log(`🔑 [user] Custom auth header: ${customAuthHeader || "none"}`);

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const cookieStore = cookies();

    // Check for both Supabase session and our custom wallet session
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ [user] Session error:", sessionError.message);
    }

    if (supabaseSession) {
      console.log(
        "✅ [user] Found Supabase session for user:",
        supabaseSession.user.id,
      );

      try {
        // Get full user profile from users table instead of profiles
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", supabaseSession.user.id)
          .single();

        if (userError) {
          console.error(
            "❌ [user] Error fetching user profile:",
            userError.message,
          );

          // Return basic Supabase user data if profile not found
          return NextResponse.json({
            id: supabaseSession.user.id,
            email: supabaseSession.user.email,
            wallet_address:
              supabaseSession.user.user_metadata?.wallet_address ||
              supabaseSession.user.user_metadata?.address,
            display_name: `User_${supabaseSession.user.id.substring(0, 6)}`,
            created_at: supabaseSession.user.created_at,
            auth_type: "supabase",
          });
        }

        // Return combined data
        return NextResponse.json({
          ...userData,
          auth_type: "supabase",
          email: userData.email || supabaseSession.user.email,
          // Ensure we have the wallet address
          wallet_address:
            userData.address ||
            supabaseSession.user.user_metadata?.wallet_address,
        });
      } catch (error) {
        console.error("❌ [user] Error fetching profile:", error);

        // Return basic Supabase user data if there's any error with the profile lookup
        return NextResponse.json({
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          wallet_address: supabaseSession.user.user_metadata?.wallet_address,
          display_name: `User_${supabaseSession.user.id.substring(0, 6)}`,
          created_at: supabaseSession.user.created_at,
          auth_type: "supabase",
        });
      }
    }

    // Check for JWT wallet token (which uses hyphens in name)
    const walletJwtToken = cookieStore.get("basebuzz-wallet-token");

    if (walletJwtToken) {
      try {
        console.log("🔍 [user] Found JWT wallet token, attempting to decode");
        // Note: In production, this should verify the token with a secret key
        // For testing, we'll just decode to read the payload
        const decodedToken = jwt.decode(
          walletJwtToken.value,
        ) as WalletJwtPayload;

        if (decodedToken && decodedToken.id && decodedToken.wallet) {
          console.log(
            "✅ [user] Valid JWT wallet token for user:",
            decodedToken.id,
          );

          // Construct basic user data directly from the token
          const userData = {
            id: decodedToken.id,
            wallet_address: decodedToken.wallet,
            address: decodedToken.wallet, // For compatibility
            display_name: `Wallet ${decodedToken.wallet.substring(0, 8)}`,
            created_at: new Date(decodedToken.iat * 1000).toISOString(),
            auth_type: "wallet",
            avatar_url: null, // Default avatar
          };

          // Try to get additional user data if it exists
          try {
            // Look up user by ID or wallet address
            const { data: userDataFromDb, error: userError } = await supabase
              .from("users")
              .select("*")
              .or(
                `id.eq.${decodedToken.id},address.ilike.${decodedToken.wallet}`,
              )
              .single();

            if (userError) {
              console.log(
                "⚠️ [user] No existing user found for wallet in DB:",
                userError.message,
              );
            } else if (userDataFromDb) {
              // Return data from user lookup
              return NextResponse.json({
                ...userDataFromDb,
                auth_type: "wallet",
                wallet_address: decodedToken.wallet,
              });
            }
          } catch (error) {
            console.log("⚠️ [user] Error looking up user:", error);
          }

          // Return basic user data from token if lookup fails
          return NextResponse.json(userData);
        } else {
          console.error("❌ [user] Invalid JWT token structure:", decodedToken);
          throw new Error("Invalid JWT token structure");
        }
      } catch (error) {
        console.error("❌ [user] Error decoding JWT token:", error);
        throw new Error(
          `Error decoding JWT token: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Check for custom wallet session cookie
    const customSessionCookie = cookieStore.get("basebuzz_wallet_session");

    if (customSessionCookie) {
      try {
        console.log("🔍 [user] Parsing custom wallet session");
        const customSession = JSON.parse(
          decodeURIComponent(customSessionCookie.value),
        ) as CustomWalletSession;
        console.log(
          "✅ [user] Found custom wallet session for wallet:",
          customSession.wallet_address,
        );

        // Construct basic user data directly from the session
        const userData = {
          id: customSession.user_id,
          wallet_address: customSession.wallet_address,
          address: customSession.wallet_address, // For compatibility
          display_name: `Wallet ${customSession.wallet_address.substring(0, 8)}`,
          created_at: customSession.created_at,
          auth_type: "wallet",
          avatar_url: null, // Default avatar
        };

        // Try to get additional user data if it exists
        try {
          // Look up user by ID or wallet address
          const { data: userDataFromDb, error: userError } = await supabase
            .from("users")
            .select("*")
            .or(
              `id.eq.${customSession.user_id},address.ilike.${customSession.wallet_address}`,
            )
            .single();

          if (userError) {
            console.log(
              "⚠️ [user] No existing user found for wallet in DB:",
              userError.message,
            );
          } else if (userDataFromDb) {
            // Return data from user lookup
            return NextResponse.json({
              ...userDataFromDb,
              auth_type: "wallet",
              wallet_address: customSession.wallet_address,
            });
          }
        } catch (error) {
          console.log("⚠️ [user] Error looking up user:", error);
        }

        // Return basic user data from session if lookup fails
        return NextResponse.json(userData);
      } catch (error) {
        console.error("❌ [user] Error parsing custom session cookie:", error);
        throw new Error(
          `Error parsing custom session: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // No active session found
    return NextResponse.json(
      { error: "No active session", authenticated: false },
      { status: 401 },
    );
  } catch (error) {
    console.error("❌ [user] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        authenticated: false,
      },
      { status: 500 },
    );
  }
}
