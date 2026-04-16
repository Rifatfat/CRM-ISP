"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuButton,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui";
import { roleLabel } from "@/lib/format";
import { navigationByRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function SidebarNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={cn("flex h-full flex-col gap-6", mobile && "pt-8")}>
      <div className="space-y-3">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/90 px-4 py-2 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">CRM ISP</p>
            <p className="text-xs text-slate-500">Operational console</p>
          </div>
        </div>
        <Badge tone="info" className="w-fit">
          {roleLabel(user.role)}
        </Badge>
      </div>

      <nav className="space-y-2">
        {navigationByRole[user.role].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)]">
        <div className="rounded-[28px] border border-[var(--border)] bg-white px-6 py-5 shadow-xl">
          <p className="text-sm text-[var(--muted-foreground)]">Menyiapkan session...</p>
        </div>
      </div>
    );
  }

  const currentTitle =
    navigationByRole[user.role].find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,#e9f2ff_0%,#f8fafc_38%,#f4efe8_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:block">
          <SidebarNav />
        </aside>

        <div className="flex min-h-screen flex-col gap-4">
          <header className="sticky top-4 z-30 rounded-[28px] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_14px_50px_rgba(15,23,42,0.06)] backdrop-blur lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <MenuButton className="lg:hidden" />
                  </SheetTrigger>
                  <SheetContent>
                    <SidebarNav mobile />
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    CRM ISP Frontend
                  </p>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    {currentTitle}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-right md:block">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => void logout()}>
                      <LogOut className="size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
