import type { UserRole } from "@/lib/types";

export const SESSION_COOKIE = "crm_session";

export interface SessionSnapshot {
  userId: string;
  role: UserRole;
}

const rolePaths: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/customers", "/subscriptions", "/notifications"],
  finance: ["/dashboard", "/invoices", "/payments", "/notifications"],
  technician: ["/dashboard", "/tickets", "/notifications"],
  customer: ["/dashboard", "/me/billing", "/me/tickets", "/notifications"],
};

export function serializeSession(session: SessionSnapshot) {
  return `${session.userId}:${session.role}`;
}

export function parseSession(raw?: string | null): SessionSnapshot | null {
  if (!raw) {
    return null;
  }

  const [userId, role] = raw.split(":");

  if (!userId || !role) {
    return null;
  }

  if (!["admin", "finance", "technician", "customer"].includes(role)) {
    return null;
  }

  return {
    userId,
    role: role as UserRole,
  };
}

export function getDefaultLandingPath(role: UserRole) {
  return role === "customer" ? "/dashboard" : "/dashboard";
}

export function isPathAllowedForRole(pathname: string, role: UserRole) {
  return rolePaths[role].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
