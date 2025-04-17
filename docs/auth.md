# Authentication Flow (NextAuth + SIWE + Supabase)

This document outlines the authentication process used in this application, combining NextAuth.js with Sign-In With Ethereum (SIWE) for wallet-based login and Supabase for the backend database and storage.

## Core Technologies

- **NextAuth.js:** Handles session management, credentials providers, and JWT generation.
- **SIWE (Sign-In With Ethereum):** Provides the mechanism for users to authenticate by signing a message with their Ethereum wallet.
- **Wagmi / RainbowKit:** Used on the client-side for wallet connection and interaction (including signing messages).
- **Supabase:** Provides PostgreSQL database, storage, and authentication backend (though NextAuth manages the primary session).
- **`@supabase/auth-helpers-nextjs`:** Bridges NextAuth sessions with Supabase client instances for RLS.

## Authentication Steps (SIWE)

1.  **Connect Wallet:** User connects their wallet using RainbowKit/Wagmi (`useAccount`).
2.  **Request Nonce (CSRF Token):** Client requests a CSRF token from NextAuth (`getCsrfToken`). This token acts as the nonce for the SIWE message to prevent replay attacks.
3.  **Create SIWE Message:** Client constructs a `SiweMessage` object including domain, address, statement, URI, chain ID, and the nonce (CSRF token).
4.  **Sign Message:** Client requests the user sign the prepared SIWE message using their wallet (`signMessageAsync` from Wagmi).
5.  **Call NextAuth `signIn`:** Client sends the original message and the signature to the NextAuth `credentials` provider (`signIn('credentials', { message, signature })`).
6.  **Authorize Callback (`lib/authOptions.ts`):**
    - The backend receives the message and signature.
    - It reconstructs the `SiweMessage`.
    - It retrieves the _expected_ nonce (CSRF token) associated with the current server request.
    - It verifies the signature against the reconstructed message and the expected nonce using `siwe.verify({ signature, nonce })`.
    - If verification succeeds, it returns a `User` object containing at least the user's Ethereum address (`id: userAddress`) and potentially their handle (`handle`).
7.  **JWT Callback (`lib/authOptions.ts`):**
    - Receives the `User` object from `authorize`.
    - **Important for Supabase RLS:** Fetches the corresponding Supabase User UUID from the `public.users` table using the Ethereum address (via the `getSupabaseUserId` helper).
    - Adds the user's Ethereum address (lowercased) as `token.address`.
    - Adds the user's handle as `token.handle`.
    - **Crucially, adds the fetched Supabase User UUID as the `sub` claim (`token.sub = supabaseUserId`)**. This `sub` claim is essential for Supabase RLS policies that rely on `auth.uid()`.
    - Returns the populated `token`.
8.  **Session Callback (`lib/authOptions.ts`):**
    - Receives the JWT `token`.
    - Populates the `session.user` object with data from the token (`address`, `handle`) and by fetching additional profile details from the `public.users` table based on the address (using `getUserProfileForSession`).
    - Returns the final `session` object.
9.  **Session Established:** NextAuth sets the session cookie, and client-side hooks like `useSession` reflect the authenticated state.

## Supabase Integration & Row Level Security (RLS)

- **Auth Helpers:** Libraries like `@supabase/auth-helpers-nextjs` (`createRouteHandlerClient`, `createServerComponentClient`) are used to create Supabase client instances that are automatically configured with the user's JWT from the NextAuth session.
- **RLS Enforcement:** When these helper clients make requests to Supabase (e.g., database queries, storage operations), Supabase inspects the JWT associated with the request.
- **`auth.uid()`:** Supabase RLS policies often use `auth.uid()` to check if the requesting user matches the owner of a row. This function relies on the `sub` (subject) claim within the JWT.
- **Requirement:** For Supabase RLS based on `auth.uid()` to work correctly with NextAuth/SIWE, the **NextAuth JWT _must_ contain the `sub` claim set to the user's Supabase Auth User UUID**, as implemented in the `jwt` callback.

## Debugging Common Issues

- **Storage Uploads Failing (RLS Error / 403 Forbidden):**
  - **Check JWT `sub` Claim:** Ensure the `jwt` callback in `lib/authOptions.ts` is correctly fetching the Supabase User UUID and adding it to `token.sub`. Restart the Next.js server after changes.
  - **Check Supabase Storage Logs:** Go to your Supabase project -> Logs & Analytics -> Storage. Find the failed POST request (status code 400 or 403). Inspect the request metadata (`Raw` tab). Look for the `role` (is it `anon` or `authenticated`?) and the `jwt.payload.sub` (is it `null` or the expected UUID?). If the role is `anon` or `sub` is `null`, the JWT isn't being correctly passed or interpreted by the Auth Helper for the storage request.
  - **Service Role Workaround (for API Routes):** If RLS via Auth Helpers consistently fails for specific backend operations (like uploads from an API route) _after_ you've already verified the user's session via NextAuth (`getServerSession`), consider using the Supabase Service Role client (`supabaseServer`) for that specific Supabase operation within the API route. This bypasses RLS but is acceptable if user authentication is confirmed beforehand. See `app/api/profile/upload/route.ts` for an example.
- **UI Showing Incorrect Auth State (e.g., Wallet Address Shown When Logged Out):**
  - Distinguish between wallet _connection_ (`useAccount` from Wagmi) and application _authentication_ (`useSession` from NextAuth).
  - UI elements displaying user state (like headers) should primarily rely on `useSession` status (`authenticated`, `unauthenticated`, `loading`) rather than just `isConnected` from `useAccount`. See `components/layout/MobileHeader.tsx` for an example of conditional rendering based on session status.
- **General:**
  - Check multiple log sources: Browser console, Next.js server terminal (`server.log`), Supabase Dashboard logs.
  - Always restart the Next.js dev server after making changes to `lib/authOptions.ts`. Clearing the `.next` directory can also help resolve caching issues.
