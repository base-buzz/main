import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // Import NextAuth session helper
import { authOptions } from "@/lib/authOptions"; // Revert to alias path
import { supabaseServer } from "@/lib/supabase/server"; // Import server client
import { z } from "zod";

import type { Database } from "@/types/supabase"; // Assuming you have Supabase types generated

export async function PATCH(request: Request) {
  try {
    // 1. Authenticate using NextAuth
    console.log("🔒 [PATCH /api/profile] Verifying NextAuth session...");
    const session = await getServerSession(authOptions);

    if (!session?.user?.address) {
      console.log(
        "❌ [PATCH /api/profile] No address found in NextAuth session."
      );
      return NextResponse.json(
        { error: "Unauthorized - Missing session address" },
        { status: 401 }
      );
    }

    const userAddress = session.user.address;
    console.log(
      `✅ [PATCH /api/profile] Authenticated via NextAuth for address: ${userAddress}`
    );

    // 2. Find the user ID associated with the address
    //    (We need this to ensure we update the correct user record)
    const { data: userData, error: userFindError } = await supabaseServer
      .from("users")
      .select("id")
      .ilike("address", userAddress)
      .single();

    if (userFindError || !userData?.id) {
      console.error(
        "❌ [PATCH /api/profile] Could not find user ID for address:",
        userAddress,
        userFindError
      );
      return NextResponse.json(
        { error: "Unauthorized - User mapping failed" },
        { status: 401 }
      );
    }
    const userId = userData.id;
    console.log(`✅ [PATCH /api/profile] Found user ID: ${userId}`);

    // 3. Parse the request body
    const body = await request.json();

    // 4. Filter allowed updates (same as before)
    const allowedUpdates: Partial<
      Database["public"]["Tables"]["users"]["Update"]
    > = {};
    if (body.display_name !== undefined)
      allowedUpdates.display_name = body.display_name;
    if (body.bio !== undefined) allowedUpdates.bio = body.bio;
    if (body.location !== undefined) allowedUpdates.location = body.location;
    if (body.avatar_url !== undefined)
      allowedUpdates.avatar_url = body.avatar_url;
    if (body.header_url !== undefined)
      allowedUpdates.header_url = body.header_url;
    if (body.website_url !== undefined)
      allowedUpdates.website_url = body.website_url;

    // Ensure we don't update with an empty object
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    allowedUpdates.updated_at = new Date().toISOString();

    // 5. Update the user profile using supabaseServer (service role)
    console.log(
      `🔄 [PATCH /api/profile] Updating profile for user ID: ${userId}`
    );
    const { data, error: updateError } = await supabaseServer // Use service role client
      .from("users")
      .update(allowedUpdates)
      .eq("id", userId) // Update based on the verified user ID
      .select("*, website_url, birth_date") // Ensure new fields are selected
      .single();

    if (updateError) {
      console.error(
        "❌ [PATCH /api/profile] Error updating profile:",
        updateError
      );
      return NextResponse.json(
        { error: "Failed to update profile", details: updateError.message },
        { status: 500 }
      );
    }

    // 6. Return success response
    console.log(
      `✅ [PATCH /api/profile] Profile updated successfully for user ID: ${userId}`
    );
    return NextResponse.json({
      message: "Profile updated successfully",
      user: data,
    });
  } catch (err) {
    console.error("Unexpected error in PATCH /api/profile:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
