import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// Add custom properties to the User object returned by the authorize callback
declare module "next-auth" {
  interface User extends DefaultUser {
    address?: string | null;
    handle?: string | null; // Add handle if you manage it
  }

  // Add custom properties to the Session object returned by useSession/getSession
  interface Session extends DefaultSession {
    user: {
      address?: string | null;
      handle?: string | null; // Add handle if you manage it
    } & DefaultSession["user"]; // Keep existing fields (name, email, image)
  }
}

// Add custom properties to the JWT token used internally
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    address?: string | null;
    handle?: string | null; // Add handle if you manage it
  }
}
