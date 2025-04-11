/**
 * src/lib/authOptions.ts
 *
 * Centralized NextAuth.js configuration options.
 * Imported by both the API route handler and server components.
 */
import { type NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

// --- Environment Variable Checks (Keep them here or move to a separate config loader) --- //
if (!process.env.NEXTAUTH_SECRET) {
  console.error("Auth Setup Error - NEXTAUTH_SECRET missing");
  throw new Error("NEXTAUTH_SECRET is not set");
}
if (!process.env.NEXTAUTH_URL) {
  console.error("Auth Setup Error - NEXTAUTH_URL missing");
  throw new Error("NEXTAUTH_URL is not set");
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Auth Setup Error - Supabase connection details missing");
  throw new Error("Supabase URL or Service Role Key is not set");
}

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
});

let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
  console.log("Auth Environment Variables Validated (in lib/authOptions)");
} catch (error) {
  console.error(
    "Auth Setup Error - Environment variable validation failed (in lib/authOptions)",
    { error }
  );
  throw new Error("Environment variable validation failed");
}

// --- Helper Function: Get/Generate User Handle (Keep it here as it's used by authOptions) --- //
async function getUserHandle(address: string): Promise<string | null> {
  if (!supabaseServer) {
    console.error("getUserHandle - Supabase client unavailable");
    return null;
  }
  const lowerCaseAddress = address.toLowerCase();
  console.log("getUserHandle - Attempting to find/generate handle", {
    address: lowerCaseAddress,
  });
  try {
    const { data: user, error: selectError } = await supabaseServer
      .from("users")
      .select("handle")
      .eq("address", lowerCaseAddress)
      .maybeSingle();
    if (selectError && selectError.code !== "PGRST116") {
      console.error("getUserHandle - Supabase select error", {
        address: lowerCaseAddress,
        code: selectError.code,
        message: selectError.message,
      });
      throw selectError;
    }
    if (user?.handle) {
      console.log("getUserHandle - Found existing handle", {
        address: lowerCaseAddress,
        handle: user.handle,
      });
      return user.handle;
    } else {
      const generatedHandle = lowerCaseAddress.slice(-6);
      console.log(
        "getUserHandle - Handle is missing or user not found, using generated handle",
        { address: lowerCaseAddress, generatedHandle }
      );
      if (user) {
        console.log(
          "getUserHandle - Updating existing user with generated handle",
          { address: lowerCaseAddress }
        );
        const { data: updatedUser, error: updateError } = await supabaseServer
          .from("users")
          .update({
            handle: generatedHandle,
            updated_at: new Date().toISOString(),
          })
          .eq("address", lowerCaseAddress)
          .select("handle")
          .single();
        if (updateError) {
          console.error("getUserHandle - Supabase update error", {
            address: lowerCaseAddress,
            error: updateError,
          });
          throw updateError;
        }
        console.log("getUserHandle - Handle updated successfully", {
          address: lowerCaseAddress,
          handle: updatedUser?.handle,
        });
        return updatedUser?.handle ?? null;
      } else {
        console.log(
          "getUserHandle - Inserting new user with generated handle",
          { address: lowerCaseAddress }
        );
        const { data: newUser, error: insertError } = await supabaseServer
          .from("users")
          .insert({ address: lowerCaseAddress, handle: generatedHandle })
          .select("handle")
          .single();
        if (insertError) {
          console.error("getUserHandle - Supabase insert error", {
            address: lowerCaseAddress,
            error: insertError,
          });
          throw insertError;
        }
        console.log("getUserHandle - New user inserted successfully", {
          address: lowerCaseAddress,
          handle: newUser?.handle,
        });
        return newUser?.handle ?? null;
      }
    }
  } catch (error) {
    console.error(
      `Failed to get/generate handle for ${lowerCaseAddress}:`,
      error
    );
    return null;
  }
}

// --- NextAuth Configuration Export --- //
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
      },
      async authorize(credentials, req) {
        const addressFromMessage = credentials?.message
          ? JSON.parse(credentials.message).address
          : "unknown";
        console.log("SIWE Authorize Start", { address: addressFromMessage });
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.warn(
              "SIWE Authorize Failed - Missing message or signature"
            );
            return null;
          }
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const userAddress = siwe.address;
          console.log("SIWE Authorize - SIWE Message Created", {
            address: userAddress,
            nonce: siwe.nonce,
          });
          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });
          if (!csrfToken) {
            console.error("SIWE Authorize Failed - Could not get CSRF token", {
              address: userAddress,
            });
            return null;
          }
          console.log("SIWE Authorize - CSRF Token Obtained", {
            address: userAddress,
          });
          console.log("SIWE Authorize - Verifying Signature...", {
            address: userAddress,
          });
          const result = await siwe.verify({
            signature: credentials.signature,
            nonce: csrfToken,
          });
          if (result.success) {
            console.log("SIWE Auth Success, Getting Handle", {
              address: userAddress,
            });
            console.log(
              "Checking supabaseServer BEFORE calling getUserHandle:",
              !!supabaseServer
            );
            const userHandle = await getUserHandle(userAddress);
            console.log("SIWE Authorize - Returning User Object", {
              address: userAddress,
              handle: userHandle,
            });
            return {
              id: userAddress,
              address: userAddress,
              handle: userHandle,
            } as User;
          }
          const errorString = result.error
            ? JSON.stringify(result.error)
            : "Unknown verification error";
          console.warn("SIWE Verification Failed", {
            address: userAddress,
            error: errorString,
          });
          console.error("SIWE verification failed details:", result.error);
          return null;
        } catch (e: unknown) {
          const errorMessage =
            e instanceof Error ? e.message : "Unknown SIWE authorize error";
          console.error("SIWE Authorize Exception", {
            error: errorMessage,
            rawError: e,
            address: addressFromMessage,
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      const tokenSub = token?.sub;
      if (user?.id) {
        // Runs on initial sign in
        const originalAddress = user.id;
        const lowerCaseAddress = originalAddress.toLowerCase();
        console.log("JWT Callback - Initial Sign In", {
          originalAddress: originalAddress,
          lowerCaseAddress: lowerCaseAddress,
        });
        token.address = lowerCaseAddress; // Assign lowercased address
        // Fetch handle using lowercased address for consistency
        token.handle = user.handle ?? (await getUserHandle(lowerCaseAddress));
        console.log("JWT Callback - Handle added/fetched for initial sign in", {
          tokenSub: lowerCaseAddress, // Log lowercased address
          handle: token.handle,
        });
      } else if (tokenSub && !token.address) {
        // Runs on subsequent accesses if address needs re-adding
        const originalAddress = tokenSub;
        const lowerCaseAddress = originalAddress.toLowerCase();
        token.address = lowerCaseAddress; // Assign lowercased address
        console.warn("JWT Callback - Re-adding address to token (lowercased)", {
          originalAddress: originalAddress,
          lowerCaseAddress: lowerCaseAddress,
        });
        // Optionally try to fetch handle again if it wasn't present
        if (!token.handle) {
          console.log("JWT Callback - Attempting to fetch missing handle", {
            lowerCaseAddress,
          });
          token.handle = await getUserHandle(lowerCaseAddress);
          console.log("JWT Callback - Fetched missing handle result:", {
            handle: token.handle,
          });
        }
      } else if (
        token?.address &&
        typeof token.address === "string" &&
        token.address !== token.address.toLowerCase()
      ) {
        // Safety check: If token.address exists but isn't lowercase, fix it.
        const originalAddress = token.address;
        const lowerCaseAddress = originalAddress.toLowerCase();
        console.warn(
          "JWT Callback - Found non-lowercase address in existing token, fixing.",
          { originalAddress, lowerCaseAddress }
        );
        token.address = lowerCaseAddress;
      }

      return token;
    },
    async session({ session, token }) {
      // Ensure we have the user's address (which is the primary ID in this setup)
      const userAddress = token?.address as string | undefined;

      if (userAddress) {
        // Always assign the address from the token
        session.user.address = userAddress;

        try {
          console.log("Session Callback - Fetching user profile from DB", {
            address: userAddress,
          });
          const { data: userProfile, error } = await supabaseServer
            .from("users")
            .select(
              "handle, display_name, avatar_url, header_url, bio, location, tier, email" // Select all needed fields
            )
            .eq("address", userAddress)
            .single(); // Use single() as address should be unique

          if (error) {
            // Handle case where user might not be in DB yet or other errors
            // PGRST116: Row not found - expected if getUserHandle failed or hasn't run
            if (error.code !== "PGRST116") {
              console.error(
                "Session Callback - Supabase error fetching profile",
                {
                  address: userAddress,
                  code: error.code,
                  message: error.message,
                }
              );
            } else {
              console.log(
                "Session Callback - User not found in DB yet, returning basic session",
                { address: userAddress }
              );
              // Assign handle from token if DB lookup failed but token has it (from initial sign-in)
              session.user.handle = token.handle as string | null;
              // Keep other fields default/null as user profile doesn't exist
              session.user.name = null;
              session.user.image = null;
              (session.user as any).bio = null;
              (session.user as any).location = null;
              (session.user as any).header_url = null;
              (session.user as any).tier = null;
              session.user.email = null; // Ensure email is also cleared if profile not found
            }
          } else if (userProfile) {
            console.log(
              "Session Callback - User profile fetched successfully",
              { address: userAddress }
            );
            // Populate session.user with fetched data
            session.user.handle = userProfile.handle;
            session.user.name = userProfile.display_name; // Map display_name to session.user.name
            session.user.image = userProfile.avatar_url; // Map avatar_url to session.user.image
            session.user.email = userProfile.email; // Map email if needed
            // Add other fields to session.user (requires casting or extending Session type)
            (session.user as any).bio = userProfile.bio;
            (session.user as any).location = userProfile.location;
            (session.user as any).header_url = userProfile.header_url;
            (session.user as any).tier = userProfile.tier;

            // Log the populated session user object for verification
            // console.log(
            //   "Session Callback - Populated session.user:",
            //   session.user
            // );
            // Explicitly log the image/avatar URL being set
            console.log(
              "Session Callback - Setting session.user.image to:",
              session.user.image,
              "for address:",
              userAddress
            );
          } else {
            console.warn(
              "Session Callback - User profile fetch returned null data without error",
              { address: userAddress }
            );
            // Fallback: Assign handle from token if available
            session.user.handle = token.handle as string | null;
            // Ensure other fields are null/default
            session.user.name = null;
            session.user.image = null;
            (session.user as any).bio = null;
            (session.user as any).location = null;
            (session.user as any).header_url = null;
            (session.user as any).tier = null;
            session.user.email = null;
          }
        } catch (err) {
          console.error(
            "Session Callback - Unexpected error fetching profile",
            {
              address: userAddress,
              error: err,
            }
          );
          // Fallback in case of unexpected error
          session.user.handle = token.handle as string | null; // Assign handle from token if available
          session.user.name = null;
          session.user.image = null;
          (session.user as any).bio = null;
          (session.user as any).location = null;
          (session.user as any).header_url = null;
          (session.user as any).tier = null;
          session.user.email = null;
        }
      } else {
        console.warn("Session Callback - Token address missing", { token });
        // Clear user data if token is invalid/missing address
        session.user = {};
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("NextAuth Event: signIn", {
        userId: user.id,
        provider: account?.provider,
      });
    },
    async signOut({ token }) {
      console.log("NextAuth Event: signOut", { userId: token?.sub });
    },
  },
  // debug: process.env.NODE_ENV === 'development',
};
