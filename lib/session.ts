import { SessionOptions } from "iron-session";
import { SiweMessage } from "siwe";

// Define the shape of our session data
export interface SessionData {
  siwe?: SiweMessage; // Store the verified SIWE message
  userId?: string; // Optional: Store Supabase user ID if linked
  // Add other session fields as needed
}

// Ensure the password is set and meets the length requirement
const IRON_SESSION_PASSWORD = process.env.IRON_SESSION_PASSWORD;

if (!IRON_SESSION_PASSWORD || IRON_SESSION_PASSWORD.length < 32) {
  throw new Error(
    "Missing or insecure IRON_SESSION_PASSWORD environment variable. It must be at least 32 characters long."
  );
}

export const sessionOptions: SessionOptions = {
  password: IRON_SESSION_PASSWORD,
  cookieName: "myapp-siwe-session", // Choose a unique cookie name
  // secure: true should be used in production (HTTPS)
  // process.env.NODE_ENV === "production"
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    // sameSite: "lax", // Consider strict if applicable
    // httpOnly: true, // Recommended for security
  },
};

// Augment the IronSessionData interface to include nonce and siwe fields
// This provides type safety for session data
declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    siwe?: import("siwe").SiweMessage; // Store the verified SIWE message
    // You could add other session data here, like a user ID after linking
  }
}
