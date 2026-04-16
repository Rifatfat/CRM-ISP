import type {
  CustomerStatus,
  InvoiceStatus,
  SubscriptionStatus,
  TicketStatus,
  UserRole,
} from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, compact = false) {
  return compact
    ? compactCurrencyFormatter.format(value)
    : currencyFormatter.format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatMonth(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01`));
}

export function roleLabel(role: UserRole) {
  return {
    admin: "Admin",
    finance: "Finance",
    technician: "Technician",
    customer: "Customer",
  }[role];
}

export function statusLabel(
  status: CustomerStatus | SubscriptionStatus | InvoiceStatus | TicketStatus,
) {
  return {
    active: "Active",
    suspended: "Suspended",
    grace_period: "Grace Period",
    unpaid: "Unpaid",
    paid: "Paid",
    overdue: "Overdue",
    open: "Open",
    assigned: "Assigned",
    resolved: "Resolved",
  }[status];
}
