import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, getDefaultLandingPath, parseSession } from "@/lib/session";

export default async function Home() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/login");
  }

  redirect(getDefaultLandingPath(session.role));
}
