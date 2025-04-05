import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  try {
    // Get user session to ensure someone is logged in before attempting logout
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout error:", error);
        // Even if server-side signout fails, client-side should still proceed
        return NextResponse.json(
          { error: "Server signout failed", details: error.message },
          { status: 500 }
        );
      }
    } else {
      // No active session, but return success as the goal is to be logged out
      return NextResponse.json(
        { message: "No active session to log out from." },
        { status: 200 }
      );
    }

    // Success
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in POST /api/auth/logout:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
