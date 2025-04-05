import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const formData = await request.json();
  const email = formData.email as string;
  const password = formData.password as string;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  // Basic validation
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signin error:", error);
      // Distinguish between client errors (wrong password) and server errors
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid login credentials" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Signin failed" },
        { status: 500 }
      );
    }

    // Success: Session is established by Supabase helpers setting cookies
    // The AuthContext's onAuthStateChange listener will handle the state update
    return NextResponse.json(
      { message: "Signin successful", user: data.user, session: data.session },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/auth/login:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
