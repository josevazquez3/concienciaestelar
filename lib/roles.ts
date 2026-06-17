import { Role } from "@prisma/client";
import type { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === Role.ADMIN;
}

export function requireAdmin(session: Session | null): boolean {
  return isAdmin(session);
}

export function hasPermission(
  session: Session | null,
  permission: string
): boolean {
  if (!session?.user) return false;
  if (session.user.role === Role.ADMIN) return true;
  return session.user.permissions?.includes(permission) ?? false;
}
