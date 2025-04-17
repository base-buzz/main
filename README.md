# main

## Development & Debugging Notes

Key takeaways and debugging strategies from development:

- **Authentication (Wallet Connection vs. SIWE):**

  - It's crucial to differentiate between a wallet being _connected_ (e.g., using `useAccount` from Wagmi) and the user being _authenticated_ with the application (e.g., using `useSession` from NextAuth after a SIWE signature).
  - UI elements should reflect the actual application authentication state (`sessionStatus === 'authenticated'`), not just the wallet connection state, to avoid showing authenticated views or actions to users who have only connected their wallet but not signed in.
  - See `components/layout/MobileHeader.tsx` for an example of handling this distinction.

- **Supabase RLS & NextAuth JWT Integration:**

  - When using Supabase RLS policies that rely on `auth.uid()`, the JWT passed from NextAuth (via `@supabase/auth-helpers-nextjs`) **must** contain the `sub` claim set to the user's Supabase Auth User UUID.
  - This requires fetching the Supabase User UUID (e.g., from the `public.users` table) based on the verified Ethereum address within the `jwt` callback in `lib/authOptions.ts` and adding it to the token.
  - See `docs/auth.md` for the detailed flow.

- **Debugging Storage RLS Errors (403 Forbidden):**

  - Check the Supabase Dashboard logs (Logs & Analytics -> Storage).
  - Inspect the failed request's metadata (`Raw` tab).
  - Verify the `role` being used (e.g., `anon`, `authenticated`).
  - Verify the `jwt.payload.sub` claim (is it `null` or the expected UUID?).
  - If the `role` is `anon` or `sub` is missing/null despite the user being logged in according to NextAuth, the Auth Helper might not be correctly passing/interpreting the JWT context for that specific operation.
  - **Workaround:** For backend API routes where user authentication is _already verified_ (e.g., using `getServerSession`), consider using the Supabase Service Role client (`supabaseServer`) for the specific Storage operation (like uploads) as a reliable way to bypass RLS issues. See `app/api/profile/upload/route.ts`.

- **General Debugging:**
  - Utilize multiple log sources: Browser Developer Console, Next.js Server Terminal Output (`server.log`), Supabase Dashboard Logs.
  - **Restart Server:** Always restart the Next.js development server after making changes to `lib/authOptions.ts` or other core configuration files.
  - **Clear Cache:** Clearing the `.next` directory before restarting can sometimes resolve stubborn caching issues.
  - **Hard Refresh:** Use browser hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to bypass browser cache when testing UI changes related to authentication or data fetching.
