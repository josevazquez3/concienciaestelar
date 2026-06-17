import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export default {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAdminApi = nextUrl.pathname.startsWith("/api/admin");
      const isAuthPage =
        nextUrl.pathname.startsWith("/auth/login") ||
        nextUrl.pathname.startsWith("/auth/register");

      if (isDashboard || isAdminApi) {
        return isLoggedIn;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.permissions = user.permissions ?? [];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.permissions = (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
