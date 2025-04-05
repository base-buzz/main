import { NextResponse } from "next/server";
import { generateAllMockData } from "@/utils/mockDataGenerator";

export async function GET() {
  // Make sure this endpoint is only accessible in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 },
    );
  }

  try {
    await generateAllMockData();
    return NextResponse.json({ message: "Mock data generated successfully" });
  } catch (error) {
    console.error("Error generating mock data:", error);
    return NextResponse.json(
      { error: "Failed to generate mock data" },
      { status: 500 },
    );
  }
}
