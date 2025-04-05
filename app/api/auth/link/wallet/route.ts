import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { handleSupabaseError } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ethers } from "ethers";

/**
 * POST: Link a wallet to an existing account
 *
 * This endpoint handles linking a wallet to an existing user account:
 * 1. Verifies the user is authenticated
 * 2. Verifies the wallet signature to prove ownership
 * 3. Creates an identity entry linking the wallet
 * 4. Updates the public.users record with the wallet address
 */
export async function POST(request: NextRequest) {
  try {
    const { address, message, signature } = await request.json();

    // Validate required fields
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Address, message, and signature are required" },
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

    // Verify the signature to ensure wallet ownership
    let isValidSignature = false;
    try {
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      isValidSignature = signerAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("Error verifying signature:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 403 },
      );
    }

    // Check if the wallet is already linked to another account
    const { data: existingUsers, error: checkError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("address", address)
      .neq("id", user.id) // Exclude current user
      .limit(1);

    if (checkError) {
      console.error("Error checking existing wallet links:", checkError);
      return NextResponse.json(
        { error: "Error checking wallet availability" },
        { status: 500 },
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "This wallet is already linked to another account" },
        { status: 409 },
      );
    }

    // Create the identity entry linking the wallet to the user
    const { error: identityError } = await supabaseServer
      .from("identities")
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        provider: "wallet",
        identity_data: {
          address: address.toLowerCase(),
          verified_at: new Date().toISOString(),
        },
        provider_id: `wallet:${address.toLowerCase()}`,
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (identityError) {
      console.error("Error creating identity:", identityError);
      return NextResponse.json(
        { error: "Failed to link wallet" },
        { status: 500 },
      );
    }

    // Update the user's wallet address in public.users
    const { error: updateError } = await supabaseServer
      .from("users")
      .update({
        address: address.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user record:", updateError);
      // Attempt to clean up identity if user update fails
      await supabaseServer
        .from("identities")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "wallet")
        .eq("provider_id", `wallet:${address.toLowerCase()}`);

      return NextResponse.json(
        { error: "Failed to update user record" },
        { status: 500 },
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Wallet linked successfully",
      address: address.toLowerCase(),
    });
  } catch (error) {
    console.error("Unexpected error linking wallet:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
