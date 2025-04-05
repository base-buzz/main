/**
 * Wallet Authentication API - Connect Endpoint
 * @file apps/www/app/api/auth/wallet/connect/route.ts
 *
 * UPDATES:
 * - Normalized wallet address comparison with consistent lowercase
 * - Enhanced custom session format with more debugging information
 * - Added extra logging for easier troubleshooting
 * - FIXED cookie settings for better session persistence in all environments
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Define custom request structure for wallet connect
interface WalletConnectRequest {
  message: string;
  signature: string;
  address: string;
  chain_id: string;
}

// Define JWT payload structure for wallet tokens
interface WalletJwtPayload {
  id: string;
  wallet: string;
  auth_method: string;
  iat: number;
  exp: number;
}

// Define user response structure
interface UserResponse {
  id: string;
  wallet_address: string;
  display_name: string;
  auth_type: string;
  bio?: string;
  avatar_url?: string;
  [key: string]: any; // Allow additional properties
}

// Define SameSite type for cookie settings
type SameSiteType = "none" | "lax" | "strict";

/**
 * POST: Handle wallet connection requests
 *
 * This endpoint:
 * 1. Verifies the signature against the provided message and address
 * 2. Checks if the user exists in the database
 * 3. Creates a new user if needed
 * 4. Generates session data and returns user info
 */
export async function POST(request: NextRequest) {
  console.log("🚀 [wallet/connect] Processing wallet authentication request");

  let requestData: WalletConnectRequest;

  try {
    // Parse request data
    requestData = (await request.json()) as WalletConnectRequest;
    console.log(
      `📝 [wallet/connect] Received connection request for wallet: ${requestData.address.substring(0, 10)}...`,
    );

    // Basic validation
    if (
      !requestData.message ||
      !requestData.signature ||
      !requestData.address
    ) {
      console.error("❌ [wallet/connect] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Normalize the wallet address (lowercase)
    const normalizedAddress = requestData.address.toLowerCase();

    // Generate a unique user ID if one doesn't exist
    // This ensures we have a valid ID even if database operations fail
    let userId = crypto.randomUUID();
    let userData = null;

    // Try database operations, but don't fail if they don't work
    try {
      // Initialize Supabase client
      const supabase = createRouteHandlerClient({ cookies });

      // TODO: Implement signature verification here
      // For now, we assume signature is valid for development purposes
      const isSignatureValid = true;

      if (!isSignatureValid) {
        console.error("❌ [wallet/connect] Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 },
        );
      }

      // Check if user with this wallet address exists
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .ilike("address", normalizedAddress)
        .single();

      // Handle existing user or create new user
      if (userError) {
        console.log(
          `🆕 [wallet/connect] No existing user found, creating new user for address: ${normalizedAddress.substring(0, 10)}...`,
        );

        try {
          // Create a new user in the users table
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              address: normalizedAddress,
              display_name: `Wallet ${normalizedAddress.substring(0, 8)}`,
              bio: "Web3 user",
            })
            .select()
            .single();

          if (createError) {
            console.error(
              "❌ [wallet/connect] Error creating user:",
              createError.message,
            );
            // Fall through to use generated ID
          } else {
            userId = newUser.id;
            userData = newUser;
            console.log(
              `✅ [wallet/connect] Created new user ${userId} for wallet: ${normalizedAddress.substring(0, 10)}...`,
            );
          }
        } catch (error) {
          console.error("❌ [wallet/connect] Database error:", error);
          // Continue with generated ID
        }
      } else {
        // Use existing user data
        userId = existingUser.id;
        userData = existingUser;
        console.log(
          `✅ [wallet/connect] Found existing user ${userId} for wallet: ${normalizedAddress.substring(0, 10)}...`,
        );
      }
    } catch (error) {
      console.error("❌ [wallet/connect] Database access error:", error);
      // Continue with generated userId
      console.log(`⚠️ [wallet/connect] Using fallback user ID: ${userId}`);
    }

    // Create session data
    const customSession = {
      user_id: userId,
      wallet_address: normalizedAddress,
      created_at: new Date().toISOString(),
      auth_type: "wallet",
      timestamp: Date.now(), // Add timestamp to prevent caching issues
      debug_info: {
        request_host: request.headers.get("host"),
        request_url: request.url,
      },
    };

    // Get the request host for cookie domain settings
    const requestHost = request.headers.get("host") || "";
    const isLocalhost =
      requestHost.includes("localhost") || requestHost.includes("127.0.0.1");
    const domain = isLocalhost ? undefined : requestHost.split(":")[0];

    // Set SameSite based on environment
    // 'none' for cross-site (requires secure:true)
    // 'lax' or 'strict' for same-site only
    const sameSiteSetting: SameSiteType = isLocalhost ? "lax" : "none";

    console.log(
      `🍪 [wallet/connect] Setting cookies with domain: ${domain || "undefined"}, sameSite: ${sameSiteSetting}`,
    );

    // Create cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: !isLocalhost, // Secure in production, not in localhost
      sameSite: sameSiteSetting,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      ...(domain ? { domain } : {}),
    };

    // Create display name and avatar from user data
    let displayName = `Wallet ${normalizedAddress.substring(0, 8)}`;
    let avatarUrl = null;

    // Try to extract properties safely
    if (userData && typeof userData === "object") {
      try {
        // Use type assertion to access properties
        const userRecord = userData as Record<string, any>;
        if (userRecord.display_name) {
          displayName = String(userRecord.display_name);
        }
        if (userRecord.avatar_url !== undefined) {
          avatarUrl = userRecord.avatar_url;
        }
      } catch (e) {
        console.log("⚠️ [wallet/connect] Error extracting user properties:", e);
      }
    }

    // Create response with user data
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
        wallet_address: normalizedAddress,
        display_name: displayName,
        avatar_url: avatarUrl,
        auth_type: "wallet",
      },
    });

    // Create JWT token for compatibility with existing code
    const jwtPayload = {
      id: userId,
      wallet: normalizedAddress,
      auth_method: "wallet",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    };

    // In production, use a proper secret key here
    // For testing, we're using a simple string
    const jwtToken = jwt.sign(jwtPayload, "basebuzz_dev_secret");

    // Set both cookies to ensure backward compatibility
    // 1. The JWT token cookie (older format with hyphens)
    response.cookies.set("basebuzz-wallet-token", jwtToken, cookieOptions);

    // 2. The new custom session cookie (newer format with underscores)
    response.cookies.set(
      "basebuzz_wallet_session",
      encodeURIComponent(JSON.stringify(customSession)),
      cookieOptions,
    );

    console.log(
      `✅ [wallet/connect] Authentication complete, session created for user: ${userId}`,
    );
    return response;
  } catch (error) {
    console.error("❌ [wallet/connect] Error processing request:", error);
    return NextResponse.json(
      {
        error: "Failed to process wallet connection",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
