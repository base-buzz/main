import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { handleSupabaseError } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * POST: Unlink a wallet from an existing account
 *
 * This endpoint handles unlinking a wallet from a user account:
 * 1. Verifies the user is authenticated
 * 2. Removes the identity entry for the wallet
 * 3. Updates the user's wallet address to null
 */
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 },
      );
    }

    // Get the current session
    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get the user from the session
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Get current user data to verify wallet ownership
    const { data: userData, error: userDataError } = await supabaseServer
      .from("users")
      .select("address")
      .eq("id", user.id)
      .single();

    if (userDataError) {
      console.error("Error getting user data:", userDataError);
      return NextResponse.json(
        { error: "Error retrieving user data" },
        { status: 500 },
      );
    }

    // Verify the wallet address matches
    if (userData.address?.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "This wallet is not linked to your account" },
        { status: 403 },
      );
    }

    // Delete the identity entry for this wallet
    const { error: deleteError } = await supabaseServer
      .from("identities")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "wallet")
      .eq("provider_id", `wallet:${address.toLowerCase()}`);

    if (deleteError) {
      console.error("Error deleting identity:", deleteError);
      return NextResponse.json(
        { error: "Failed to unlink wallet" },
        { status: 500 },
      );
    }

    // Update user record to remove wallet address
    const { error: updateError } = await supabaseServer
      .from("users")
      .update({
        address: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      return NextResponse.json(
        { error: "Failed to update user record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wallet unlinked successfully",
    });
  } catch (error) {
    console.error("Unexpected error unlinking wallet:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
