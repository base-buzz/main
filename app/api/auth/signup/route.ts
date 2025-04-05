import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Optional: email confirmation, data, etc.
        // emailRedirectTo: `${requestUrl.origin}/auth/callback`, // Example redirect
      },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      // Consider mapping Supabase error codes to user-friendly messages
      return NextResponse.json(
        { error: error.message || "Signup failed" },
        { status: 400 }
      ); // Use 400 for client errors like existing user
    }

    // Success: User might be created but requires confirmation, or session might be active
    // The AuthContext's onAuthStateChange listener will handle the session update
    return NextResponse.json(
      {
        message: "Signup successful, check email for confirmation if enabled.",
        user: data.user,
      },
      { status: 200 }
    ); // Changed status to 200
  } catch (err) {
    console.error("Unexpected error in POST /api/auth/signup:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
