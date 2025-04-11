/**
 * src/app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth.js API route handler.
 * Imports the centralized authOptions configuration.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Import centralized config

// --- Remove Duplicated Imports and Definitions --- //
// import CredentialsProvider from "next-auth/providers/credentials";
// import { getCsrfToken } from "next-auth/react";
// import { SiweMessage } from "siwe";
// import { z } from "zod";
// import { supabaseServer } from "@/lib/supabase/server";
// ... Remove env checks, schema validation, getUserHandle function ...
// ... Remove authOptions definition ...
// --- End Removal --- //

// --- Handler Export --- //
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
