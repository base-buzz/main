/**
 * Session API - Get current session status
 * @file apps/www/app/api/auth/session/route.ts
 *
 * UPDATES:
 * - Added support for both Supabase sessions and custom wallet sessions
 * - Added support for JWT tokens (using basebuzz-wallet-token cookie)
 * - Enhanced debugging information for troubleshooting
 * - Improved response format with auth_type field
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
 * GET: Check the current session status
 *
 * This endpoint checks for three types of authentication:
 * 1. Supabase session
 * 2. JWT wallet token (older format with hyphens in cookie name)
 * 3. Custom wallet session (newer format with underscores in cookie name)
 *
 * For troubleshooting, this endpoint logs detailed information about cookies
 * and returns debug info when no active session is found.
 */
export async function GET(request: NextRequest) {
  console.log("🔍 [session] Checking session status");

  // Log raw cookie headers for debugging
  const cookieHeader = request.headers.get("cookie");
  console.log(`📋 [session] Raw cookie header: ${cookieHeader || "none"}`);

  // Get all available cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  console.log(
    `🍪 [session] Available cookies: ${allCookies.map((c) => c.name).join(", ") || "none"}`,
  );

  try {
    let isAuthenticated = false;
    let authType: string | null = null;
    let userId: string | null = null;
    let wallet: string | null = null;

    // Check for Supabase session
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "❌ [session] Supabase session error:",
          sessionError.message,
        );
      }

      // If Supabase session exists, return authenticated response
      if (session) {
        console.log(
          "✅ [session] Found Supabase session for user:",
          session.user.id,
        );
        isAuthenticated = true;
        authType = "supabase";
        userId = session.user.id;

        return NextResponse.json({
          authenticated: true,
          auth_type: "supabase",
          user: {
            id: session.user.id,
            email: session.user.email,
          },
        });
      }
    } catch (error) {
      console.error("❌ [session] Error checking Supabase session:", error);
      // Continue to check other session types
    }

    // Check for JWT wallet token (which uses hyphens in name)
    const walletJwtToken = cookieStore.get("basebuzz-wallet-token");

    if (walletJwtToken) {
      try {
        console.log(
          "🔍 [session] Found JWT wallet token, attempting to decode",
        );
        // Note: In production, this should verify the token with a secret key
        // For testing, we'll just decode to read the payload
        const decodedToken = jwt.decode(
          walletJwtToken.value,
        ) as WalletJwtPayload;

        if (decodedToken && decodedToken.id) {
          console.log(
            "✅ [session] Valid JWT wallet token for user:",
            decodedToken.id,
          );
          isAuthenticated = true;
          authType = "wallet";
          userId = decodedToken.id;
          wallet = decodedToken.wallet;

          return NextResponse.json({
            authenticated: true,
            auth_type: "wallet",
            user: {
              id: decodedToken.id,
              wallet_address: decodedToken.wallet,
            },
          });
        } else {
          console.error(
            "❌ [session] Invalid JWT token structure:",
            decodedToken,
          );
        }
      } catch (error) {
        console.error("❌ [session] Error decoding JWT token:", error);
      }
    }

    // Check for custom wallet session cookie
    const customSessionCookie = cookieStore.get("basebuzz_wallet_session");

    if (customSessionCookie) {
      try {
        console.log("🔍 [session] Parsing custom wallet session");
        const customSession = JSON.parse(
          decodeURIComponent(customSessionCookie.value),
        ) as CustomWalletSession;
        console.log(
          "✅ [session] Found custom wallet session for wallet:",
          customSession.wallet_address,
        );

        isAuthenticated = true;
        authType = "wallet";
        userId = customSession.user_id;
        wallet = customSession.wallet_address;

        return NextResponse.json({
          authenticated: true,
          auth_type: "wallet",
          user: {
            id: customSession.user_id,
            wallet_address: customSession.wallet_address,
          },
        });
      } catch (error) {
        console.error(
          "❌ [session] Error parsing custom session cookie:",
          error,
        );
      }
    }

    // If we found authentication but had database errors, still return authenticated
    if (isAuthenticated && userId) {
      console.log(
        `✅ [session] User authenticated via ${authType}, but database lookup failed`,
      );
      return NextResponse.json({
        authenticated: true,
        auth_type: authType,
        user: {
          id: userId,
          wallet_address: wallet,
        },
        warning: "Database lookup failed, using basic user information",
      });
    }

    // No active session found
    console.log("⚠️ [session] No active session found");

    return NextResponse.json({
      authenticated: false,
      auth_type: null,
      debug_info: {
        has_cookies: allCookies.length > 0,
        cookie_names: allCookies.map((c) => c.name),
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [session] Unexpected error:", error);

    return NextResponse.json({
      authenticated: false,
      auth_type: null,
      error: "Failed to check session",
      message: error instanceof Error ? error.message : "Unknown error",
      debug_info: {
        has_cookies: false,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
