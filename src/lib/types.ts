export type UserRole = "admin" | "finance" | "technician" | "customer";
export type CustomerStatus = "active" | "suspended";
export type SubscriptionStatus = "active" | "grace_period" | "suspended";
export type InvoiceStatus = "unpaid" | "paid" | "overdue";
export type TicketStatus = "open" | "assigned" | "resolved";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  plan: string;
  price: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  paidAt: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  issue: string;
  status: TicketStatus;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "reminder" | "billing" | "ticket" | "system";
  createdAt: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  tone: "default" | "success" | "warning" | "danger";
}

export interface MockDatabase {
  users: User[];
  customers: Customer[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: Ticket[];
  notifications: Notification[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string;
}
