/**
 * Users API - User Search and Creation
 * @file apps/www/app/api/users/route.ts
 *
 * UPDATES:
 * - Updated wallet address search to use get_user_by_wallet RPC function
 * - Improved case-insensitive wallet address lookup
 * - Enhanced error handling and response format
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserById,
  getSuggestedUsers,
  getUserByAddress,
} from "@/services/users.service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * GET: Fetch users based on query parameters
 *
 * This endpoint allows searching for users:
 * - By wallet address: /api/users?address=0x123...
 * - Multiple users: /api/users?limit=10&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Check if we're searching by wallet address
    const address = searchParams.get("address");
    if (address) {
      console.log("Searching for wallet address:", address);

      // Normalize the address
      const normalizedAddress = address.toLowerCase();

      // Use the get_user_by_wallet function for case-insensitive matching
      const { data, error } = await supabase.rpc("get_user_by_wallet", {
        wallet_address: normalizedAddress,
      });

      console.log("Query result:", { data, error });

      if (error) {
        console.error("Error querying users:", error);
        return NextResponse.json(
          { error: "Failed to fetch user" },
          { status: 500 },
        );
      }

      if (!data || data.length === 0) {
        // No user found
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(data[0]);
    }

    // Default to listing users with pagination
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Basic validation
    if (!userData) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const newUser = await createUser(userData);

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error in users API route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
