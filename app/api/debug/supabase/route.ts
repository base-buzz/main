import { NextResponse } from "next/server";
import { supabaseServer, handleSupabaseError } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check for authentication by looking for auth cookies
    const cookieStore = cookies();
    const hasAuthCookie = !!cookieStore.get("sb-access-token");
    const authCookies: { [key: string]: string } = {};

    // List all cookies for debugging (don't include values for security)
    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        authCookies[cookie.name] = "Present";
      }
    });

    // Test the connection by attempting to query the posts table
    const { data, error } = await supabaseServer
      .from("posts")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          error: "Supabase query error",
          details: handleSupabaseError(error),
          env: {
            supabaseUrl: process.env.SUPABASE_URL ? "Configured" : "Missing",
            supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
              ? "Configured"
              : "Missing",
          },
          auth: {
            hasAuthCookie,
            cookies: authCookies,
          },
        },
        { status: 500 }
      );
    }

    // Check if we successfully got data
    return NextResponse.json({
      success: true,
      connection: "Supabase connection successful",
      dataReceived: !!data,
      sampleData: data,
      tablesAvailable: true,
      auth: {
        hasAuthCookie,
        cookies: authCookies,
        information:
          "If you're not seeing posts, you may need to connect your wallet to authenticate",
      },
      help: {
        postsNotShowingReason:
          "The post column may not be showing because you're not authenticated. Try these steps:",
        steps: [
          "1. Connect your wallet using the UI",
          "2. Check the browser console for any errors",
          "3. Verify that your Supabase has the posts table with proper RLS policies",
        ],
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error",
        env: {
          supabaseUrl: process.env.SUPABASE_URL ? "Configured" : "Missing",
          supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
            ? "Configured"
            : "Missing",
        },
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
