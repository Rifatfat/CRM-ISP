"use client";

import { ensureMockDatabase } from "@/lib/mock-data";
import { SESSION_COOKIE, parseSession, serializeSession } from "@/lib/session";
import type { SessionUser } from "@/lib/types";
import { wait } from "@/lib/utils";

function setSessionCookie(value: string | null) {
  if (typeof document === "undefined") {
    return;
  }

  if (!value) {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${SESSION_COOKIE}=${value}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
}

function mapSessionUser(user: SessionUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
  };
}

export const authService = {
  async login(email: string, password: string) {
    await wait();

    const database = ensureMockDatabase();
    const user = database.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.passwordHash === password,
    );

    if (!user) {
      throw new Error("Email atau password tidak sesuai.");
    }

    const sessionUser = mapSessionUser(user);
    setSessionCookie(
      serializeSession({
        userId: user.id,
        role: user.role,
      }),
    );

    return sessionUser;
  },

  async logout() {
    await wait(50);
    setSessionCookie(null);
  },

  async getCurrentUser() {
    await wait(50);

    if (typeof document === "undefined") {
      return null;
    }

    const cookieValue = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.split("=")[1];
    const session = parseSession(cookieValue);

    if (!session) {
      return null;
    }

    const database = ensureMockDatabase();
    const user = database.users.find((candidate) => candidate.id === session.userId);

    return user ? mapSessionUser(user) : null;
  },
};
