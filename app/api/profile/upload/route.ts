import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  try {
    // 1. Authenticate user using Iron Session / SIWE
    console.log("🔒 [POST /api/profile/upload] Verifying SIWE session...");
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    if (!session.siwe?.address) {
      console.log("❌ [POST /api/profile/upload] No SIWE data in session.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // We don't strictly *need* the user ID for the upload itself,
    // just confirmation that a valid SIWE session exists.
    // But we can still use the address for logging or path generation if desired.
    const userAddress = session.siwe.address;
    console.log(
      `✅ [POST /api/profile/upload] Authenticated via SIWE for address: ${userAddress}`
    );

    // Optional: If you need the user ID, look it up as in the PATCH route
    // const { data: userData, ... } = await supabase.from('users').select('id')...
    // const userId = userData.id;
    // For now, we'll use the address for the filename for simplicity/consistency

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    // 3. Validate input
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (type !== "avatar" && type !== "header") {
      return NextResponse.json(
        { error: "Invalid type specified. Must be 'avatar' or 'header'" },
        { status: 400 }
      );
    }

    // Basic file validation (consider adding size/MIME type checks)
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    // 4. Generate file path (Using address instead of potentially unavailable userId)
    const fileExt = file.name.split(".").pop();
    // Using address ensures uniqueness even if userId lookup failed or wasn't performed
    const fileName = `${type}-${userAddress}-${Date.now()}.${fileExt}`;
    const bucketName = "public"; // Assuming a bucket named 'public' for avatars/headers
    // Store avatars in 'avatars/' folder and headers in 'headers/' folder within the bucket
    const filePath = `${type}s/${fileName}`;
    console.log(
      `ℹ️ [POST /api/profile/upload] Generated file path: ${filePath}`
    );

    // 5. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    // 6. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to get public URL for:", filePath);
      // Optionally, attempt to delete the uploaded file if getting URL fails?
      return NextResponse.json(
        { error: "File uploaded but failed to get public URL" },
        { status: 500 }
      );
    }

    // 7. Return success response
    console.log(
      `✅ [POST /api/profile/upload] Upload successful: ${publicUrlData.publicUrl}`
    );
    return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error("Unexpected error in POST /api/profile/upload:", err);
    // Check if error is due to body parsing (e.g., wrong content-type)
    if (
      err instanceof Error &&
      err.message.includes("Unsupported content type")
    ) {
      return NextResponse.json(
        { error: "Invalid request format. Use multipart/form-data." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
