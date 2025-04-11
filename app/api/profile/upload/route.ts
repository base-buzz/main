import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import type { Database } from "@/types/supabase";

// --- Check for Storage Bucket Env Var --- //
if (!process.env.SUPABASE_STORAGE_BUCKET_PROFILE) {
  console.error(
    "❌ Storage Setup Error - SUPABASE_STORAGE_BUCKET_PROFILE missing"
  );
  throw new Error("SUPABASE_STORAGE_BUCKET_PROFILE is not set in env");
}
// --- End Env Var Check --- //

export async function POST(request: Request) {
  console.log("🔒 [POST /api/profile/upload] Verifying NextAuth session...");
  const session = await getServerSession(authOptions);

  if (!session?.user?.address) {
    console.log(
      "❌ [POST /api/profile/upload] No address found in NextAuth session."
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userAddress = session.user.address;
  console.log(
    `✅ [POST /api/profile/upload] Authenticated via NextAuth for address: ${userAddress}`
  );

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (type !== "avatar" && type !== "header") {
      return NextResponse.json(
        { error: "Invalid type specified. Must be 'avatar' or 'header'" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${userAddress}-${Date.now()}.${fileExt}`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_PROFILE!;
    const filePath = `${type}s/${fileName}`;
    console.log(
      `ℹ️ [POST /api/profile/upload] Attempting upload to bucket: '${bucketName}', path: '${filePath}'`
    );

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

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to get public URL for:", filePath);
      return NextResponse.json(
        { error: "File uploaded but failed to get public URL" },
        { status: 500 }
      );
    }

    console.log(
      `✅ [POST /api/profile/upload] Upload successful: ${publicUrlData.publicUrl}`
    );
    return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error("Unexpected error in POST /api/profile/upload:", err);
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
