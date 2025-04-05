import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get("contract_address");

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 },
      );
    }

    // Check if we have an API key
    const apiKey = process.env.COINGECKO_API_KEY;
    const isProVersion = apiKey && apiKey.length > 0;

    // Use pro or free API based on key availability
    const baseUrl = isProVersion
      ? "https://pro-api.coingecko.com/api/v3"
      : "https://api.coingecko.com/api/v3";

    const response = await fetch(
      `${baseUrl}/simple/token_price/base?contract_addresses=${contractAddress}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
          ...(isProVersion ? { "x-cg-pro-api-key": apiKey } : {}),
        },
        next: {
          revalidate: 60, // Cache for 60 seconds
        },
      },
    );

    if (!response.ok) {
      console.error(
        `CoinGecko API error: ${response.status}`,
        await response.text(),
      );
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token price" },
      { status: 500 },
    );
  }
}
