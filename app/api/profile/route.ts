import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase"; // Assuming you have Supabase types generated

export async function PATCH(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  try {
    // 1. Get the session and user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    // 2. Parse the request body
    const body = await request.json();

    // Basic validation/filtering (consider Zod for robust validation)
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

    // Ensure we don't update with an empty object
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    allowedUpdates.updated_at = new Date().toISOString();

    // 3. Update the user profile in the database
    const { data, error } = await supabase
      .from("users")
      .update(allowedUpdates)
      .eq("id", user.id)
      .select() // Optionally select the updated row to return it
      .single(); // Expecting only one row to be updated

    if (error) {
      console.error("Error updating profile:", error);
      // Provide a more specific error message if possible based on error.code
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }

    // 4. Return success response
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
