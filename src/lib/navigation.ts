import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CreditCard,
  Gauge,
  LifeBuoy,
  ReceiptText,
  Router,
  Users,
  Wallet,
} from "lucide-react";

import type { UserRole } from "@/lib/types";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navigationByRole: Record<UserRole, NavigationItem[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/subscriptions", label: "Subscriptions", icon: Router },
    { href: "/notifications", label: "Notifications", icon: BellRing },
  ],
  finance: [
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/invoices", label: "Invoices", icon: ReceiptText },
    { href: "/payments", label: "Payments", icon: Wallet },
    { href: "/notifications", label: "Notifications", icon: BellRing },
  ],
  technician: [
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/tickets", label: "Tickets", icon: LifeBuoy },
    { href: "/notifications", label: "Notifications", icon: BellRing },
  ],
  customer: [
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/me/billing", label: "Billing Saya", icon: CreditCard },
    { href: "/me/tickets", label: "Ticket Saya", icon: LifeBuoy },
    { href: "/notifications", label: "Notifications", icon: BellRing },
  ],
};
