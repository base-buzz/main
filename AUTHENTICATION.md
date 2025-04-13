# Authentication Flow

This document outlines the authentication mechanism used in this application, leveraging NextAuth.js for handling user sessions and Supabase as the data store (not for authentication).

## Overview

Authentication is primarily managed by NextAuth.js. When a user logs in (e.g., via SIWE - Sign-In with Ethereum, or other configured providers), NextAuth establishes a session and issues a secure, HTTP-only cookie containing the session token. This session management happens server-side.

Supabase is used as the application's backend database for storing user data, posts, bookmarks, etc., but it **does not** handle the primary authentication flow (user login, session verification). We interact with Supabase using its client libraries, authenticating requests via service role keys on the server-side or potentially Row Level Security (RLS) policies if configured for client-side access, but the user's _identity_ is established via NextAuth.

## Global Authentication Context

NextAuth provides hooks and utilities to access the user's session information both on the client-side and server-side.

1.  **Client-Side:** The `useSession` hook from `next-auth/react` provides the session state (user object, status: loading, authenticated, unauthenticated) within React components. The `<SessionProvider>` wrapping the application in `_app.tsx` or a similar layout file makes this context available globally.
2.  **Server-Side (API Routes & Server Components):** Server-side code (API routes, `getServerSideProps`, Server Components) can access the session using utilities like `getServerSession` or `getToken` from `next-auth/next` or `next-auth`. This allows secure access to the user's identity without exposing the session token directly to the client-side JavaScript.

## Key Files

- **`pages/api/auth/[...nextauth].ts` (or `app/api/auth/[...nextauth]/route.ts`)**: The core NextAuth.js API route handler. This file defines authentication providers (e.g., Credentials, SIWE, OAuth), callbacks (like `signIn`, `jwt`, `session`), and other NextAuth configurations.
- **`lib/auth/authOptions.ts` (or similar)**: Often contains the configuration object (`AuthOptions`) passed to the NextAuth handler, keeping the main handler file cleaner.
- **`lib/supabase/server.ts`**: Initializes the Supabase client for **server-side** operations, likely using the `service_role` key for privileged access. User identity for operations here often comes from the session object retrieved via NextAuth utilities.
- **`lib/supabase/client.ts`**: Initializes the Supabase client for **client-side** operations. Authentication for these requests might rely on Supabase's RLS policies if anonymous or authenticated user keys are used, but typically, data fetching requiring authentication should happen server-side or via API routes protected by NextAuth.
- **`components/providers/SessionProvider.tsx` (or `app/layout.tsx`)**: Where the NextAuth `<SessionProvider>` wraps the application to provide global client-side session context.
- **`middleware.ts` (Optional)**: Can be used to protect specific routes or pages based on authentication status using NextAuth's `withAuth` helper or custom logic checking `getToken`.

## Rules and Best Practices

1.  **Pages & Server Components:**

    - Use `getServerSession(authOptions)` (or equivalent) within `getServerSideProps` or directly in Server Components to fetch data relevant to the logged-in user or to redirect unauthenticated users.
    - Avoid fetching sensitive user-specific data on the client-side without proper authorization checks. Prefer server-side fetching when possible.
    - Client components within server-rendered pages can use `useSession()` to conditionally render UI elements based on authentication status.

2.  **Client Components:**

    - Use the `useSession()` hook to access session status (`loading`, `authenticated`, `unauthenticated`) and user data.
    - Display loading states while the session is being determined (`status === 'loading'`).
    - Conditionally render UI elements based on `status === 'authenticated'`.
    - Use `signIn()` and `signOut()` functions from `next-auth/react` to trigger login/logout flows.

3.  **API Routes:**

    - Protect routes by fetching the session using `getServerSession(req, res, authOptions)` or `getToken({ req })` at the beginning of the handler.
    - Reject requests if no valid session exists for protected operations.
    - Extract the user ID or other relevant identifiers from the session object to perform actions specific to that user (e.g., fetching _their_ bookmarks, creating a post under _their_ name).
    - Use the server-side Supabase client (`supabaseServer`) initialized with the service role key, passing the user ID from the NextAuth session for data operations.

4.  **Service Files (`services/*.service.ts`):**

    - Service functions intended for server-side use (e.g., those called by API routes or Server Components) should accept the user ID as an argument. They should **not** attempt to fetch the session themselves. The caller (API route/Server Component) is responsible for authenticating the request and passing the necessary user context.
    - Use the server-side Supabase client (`supabaseServer`) for database interactions.

5.  **Hooks:**
    - Custom hooks needing authentication context can leverage `useSession()`.
    - Hooks performing data fetching should ideally call protected API routes rather than interacting directly with Supabase client-side, unless using Supabase RLS securely.

By adhering to these principles, we ensure that authentication is handled consistently and securely throughout the application, leveraging NextAuth for session management and Supabase purely as a data backend accessed securely based on the authenticated user's context provided by NextAuth.
