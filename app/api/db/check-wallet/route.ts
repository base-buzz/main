/**
 * Database Check API - Wallet Address Lookup
 * @file apps/www/app/api/db/check-wallet/route.ts
 *
 * UPDATES:
 * - Updated to use the get_user_by_wallet function for case-insensitive lookup
 * - Improved error handling and response format
 * - Enhanced logging for debugging
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type QueryResult = {
  success: boolean;
  data: any;
  error: string | null;
};

/**
 * GET: Debug endpoint to check if a wallet exists in the database
 * This endpoint makes a direct database query using Supabase to find a wallet address.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 },
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const normalizedAddress = address.toLowerCase();

    // Try different query approaches to help debug
    const results: {
      exact_match: QueryResult;
      ilike_match: QueryResult;
      raw_sql: QueryResult;
      rpc_function: QueryResult;
    } = {
      // Approach 1: Direct exact match
      exact_match: {
        success: false,
        data: null,
        error: null,
      },
      // Approach 2: Case insensitive match
      ilike_match: {
        success: false,
        data: null,
        error: null,
      },
      // Approach 3: Raw SQL
      raw_sql: {
        success: false,
        data: null,
        error: null,
      },
      // Approach 4: Custom function
      rpc_function: {
        success: false,
        data: null,
        error: null,
      },
    };

    // Approach 1: Direct exact match
    const { data: exactData, error: exactError } = await supabase
      .from("users")
      .select("id, address, display_name")
      .eq("address", normalizedAddress)
      .limit(1);

    results.exact_match = {
      success: !exactError,
      data: exactData,
      error: exactError ? exactError.message : null,
    };

    // Approach 2: Case insensitive match
    const { data: ilikeData, error: ilikeError } = await supabase
      .from("users")
      .select("id, address, display_name")
      .ilike("address", `%${normalizedAddress}%`)
      .limit(1);

    results.ilike_match = {
      success: !ilikeError,
      data: ilikeData,
      error: ilikeError ? ilikeError.message : null,
    };

    // Approach 3: Raw SQL
    const { data: rawData, error: rawError } = await supabase.rpc(
      "get_user_by_wallet",
      { wallet_address: normalizedAddress },
    );

    results.rpc_function = {
      success: !rawError,
      data: rawData,
      error: rawError ? rawError.message : null,
    };

    // Approach 4: Raw SQL with explicit query
    const { data: sqlData, error: sqlError } = await supabase
      .from("users")
      .select("id, address, display_name")
      .or(`address.ilike.%${normalizedAddress}%`)
      .limit(1);

    results.raw_sql = {
      success: !sqlError,
      data: sqlData,
      error: sqlError ? sqlError.message : null,
    };

    return NextResponse.json({
      wallet: normalizedAddress,
      results,
    });
  } catch (error) {
    console.error("Error checking wallet:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
