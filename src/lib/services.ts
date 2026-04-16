"use client";

import { ensureMockDatabase, saveMockDatabase } from "@/lib/mock-data";
import type {
  Customer,
  DashboardMetric,
  Invoice,
  Payment,
  SessionUser,
  Subscription,
  Ticket,
  TicketStatus,
  User,
  UserRole,
} from "@/lib/types";
import { isOverdue, makeId, wait } from "@/lib/utils";

function withDatabase<T>(callback: (database: ReturnType<typeof ensureMockDatabase>) => T) {
  const database = ensureMockDatabase();
  const result = callback(database);
  saveMockDatabase(database);
  return result;
}

function invoiceStatus(invoice: Invoice) {
  if (invoice.status === "paid") {
    return "paid";
  }

  if (isOverdue(invoice.dueDate)) {
    return "overdue";
  }

  return "unpaid";
}

function subscriptionHint(subscription: Subscription) {
  return {
    active: "Pelanggan berjalan normal dan tagihan terakhir aman.",
    grace_period: "Ada tagihan lewat 30 hari. Prioritaskan reminder dan follow up.",
    suspended: "Sudah melewati 60 hari unpaid. Reaktivasi menunggu pembayaran.",
  }[subscription.status];
}

function customerNameById(database: ReturnType<typeof ensureMockDatabase>, customerId: string) {
  return database.customers.find((customer) => customer.id === customerId)?.name ?? "-";
}

function ticketOwner(database: ReturnType<typeof ensureMockDatabase>, ticket: Ticket) {
  return database.customers.find((customer) => customer.id === ticket.customerId);
}

export const userService = {
  async listByRole(role?: UserRole) {
    await wait();
    const database = ensureMockDatabase();
    return role ? database.users.filter((user) => user.role === role) : database.users;
  },
};

export const customerService = {
  async list() {
    await wait();
    return ensureMockDatabase().customers;
  },

  async create(input: Pick<Customer, "name" | "email" | "address">) {
    await wait();
    return withDatabase((database) => {
      const customer = {
        id: makeId("cust"),
        status: "active" as const,
        createdAt: new Date().toISOString(),
        ...input,
      };
      database.customers.unshift(customer);
      return customer;
    });
  },

  async update(id: string, input: Pick<Customer, "name" | "email" | "address" | "status">) {
    await wait();
    return withDatabase((database) => {
      const customer = database.customers.find((entry) => entry.id === id);

      if (!customer) {
        throw new Error("Customer tidak ditemukan.");
      }

      Object.assign(customer, input);
      return customer;
    });
  },
};

export const subscriptionService = {
  async list() {
    await wait();
    const database = ensureMockDatabase();
    return database.subscriptions.map((subscription) => ({
      ...subscription,
      customerName: customerNameById(database, subscription.customerId),
      hint: subscriptionHint(subscription),
    }));
  },

  async create(input: Pick<Subscription, "customerId" | "plan" | "price" | "startDate" | "endDate">) {
    await wait();
    return withDatabase((database) => {
      const subscription = {
        id: makeId("sub"),
        status: "active" as const,
        ...input,
      };
      database.subscriptions.unshift(subscription);
      return subscription;
    });
  },

  async updateStatus(id: string, status: Subscription["status"]) {
    await wait();
    return withDatabase((database) => {
      const subscription = database.subscriptions.find((entry) => entry.id === id);

      if (!subscription) {
        throw new Error("Subscription tidak ditemukan.");
      }

      subscription.status = status;
      return subscription;
    });
  },
};

export const invoiceService = {
  async list() {
    await wait();
    const database = ensureMockDatabase();
    return database.invoices.map((invoice) => ({
      ...invoice,
      status: invoiceStatus(invoice),
      customerName: customerNameById(database, invoice.customerId),
      monthKey: invoice.dueDate.slice(0, 7),
    }));
  },

  async generate(input: { customerId: string; month: string }) {
    await wait();
    return withDatabase((database) => {
      const dueDate = `${input.month}-10`;
      const exists = database.invoices.some(
        (invoice) => invoice.customerId === input.customerId && invoice.dueDate === dueDate,
      );

      if (exists) {
        throw new Error("Invoice untuk customer dan periode ini sudah ada.");
      }

      const subscription = database.subscriptions.find(
        (entry) => entry.customerId === input.customerId,
      );

      if (!subscription) {
        throw new Error("Subscription customer belum tersedia.");
      }

      const invoice: Invoice = {
        id: makeId("inv"),
        customerId: input.customerId,
        amount: subscription.price,
        status: "unpaid",
        createdAt: new Date().toISOString(),
        dueDate,
      };

      database.invoices.unshift(invoice);
      return invoice;
    });
  },
};

export const paymentService = {
  async create(input: { invoiceId: string; amount: number; method: string }) {
    await wait();
    return withDatabase((database) => {
      const invoice = database.invoices.find((entry) => entry.id === input.invoiceId);

      if (!invoice) {
        throw new Error("Invoice tidak ditemukan.");
      }

      const payment: Payment = {
        id: makeId("pay"),
        invoiceId: input.invoiceId,
        amount: input.amount,
        method: input.method,
        paidAt: new Date().toISOString(),
      };

      invoice.status = "paid";
      database.payments.unshift(payment);
      return payment;
    });
  },

  async list() {
    await wait();
    const database = ensureMockDatabase();
    return database.payments.map((payment) => {
      const invoice = database.invoices.find((entry) => entry.id === payment.invoiceId);
      return {
        ...payment,
        customerName: invoice
          ? customerNameById(database, invoice.customerId)
          : "Unknown customer",
      };
    });
  },
};

export const ticketService = {
  async list() {
    await wait();
    const database = ensureMockDatabase();
    return database.tickets.map((ticket) => {
      const owner = ticketOwner(database, ticket);
      const technician = database.users.find((user) => user.id === ticket.assignedTo);
      return {
        ...ticket,
        customerName: owner?.name ?? "-",
        assignedToName: technician?.name ?? "Belum assigned",
      };
    });
  },

  async create(input: { customerId: string; issue: string }) {
    await wait();
    return withDatabase((database) => {
      const ticket: Ticket = {
        id: makeId("tic"),
        customerId: input.customerId,
        issue: input.issue,
        status: "open",
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      database.tickets.unshift(ticket);
      return ticket;
    });
  },

  async update(
    id: string,
    input: {
      status?: TicketStatus;
      assignedTo?: string | null;
    },
  ) {
    await wait();
    return withDatabase((database) => {
      const ticket = database.tickets.find((entry) => entry.id === id);

      if (!ticket) {
        throw new Error("Ticket tidak ditemukan.");
      }

      if (typeof input.assignedTo !== "undefined") {
        ticket.assignedTo = input.assignedTo;
        ticket.status = input.assignedTo ? "assigned" : "open";
      }

      if (input.status) {
        if (input.status === "resolved" && !ticket.assignedTo) {
          throw new Error("Ticket harus assigned sebelum dapat di-resolve.");
        }
        ticket.status = input.status;
      }

      ticket.updatedAt = new Date().toISOString();
      return ticket;
    });
  },
};

export const notificationService = {
  async list(userId?: string) {
    await wait();
    const database = ensureMockDatabase();
    const notifications = userId
      ? database.notifications.filter((notification) => notification.userId === userId)
      : database.notifications;
    return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

export const dashboardService = {
  async metricsFor(user: SessionUser): Promise<DashboardMetric[]> {
    await wait();
    const database = ensureMockDatabase();
    const invoices = database.invoices.map((invoice) => ({
      ...invoice,
      status: invoiceStatus(invoice),
    }));

    if (user.role === "admin") {
      return [
        {
          label: "Total Customers",
          value: database.customers.length.toString(),
          delta: "Semua data pelanggan terpusat",
          tone: "default",
        },
        {
          label: "Active Subscriptions",
          value: database.subscriptions
            .filter((subscription) => subscription.status === "active")
            .length.toString(),
          delta: "2 berjalan sehat hari ini",
          tone: "success",
        },
        {
          label: "Open Tickets",
          value: database.tickets.filter((ticket) => ticket.status !== "resolved").length.toString(),
          delta: "1 ticket belum assigned",
          tone: "warning",
        },
        {
          label: "Monthly Revenue",
          value: `Rp ${Math.round(
            database.subscriptions.reduce((sum, subscription) => sum + subscription.price, 0) / 1000,
          )}K`,
          delta: "Simulasi recurring revenue",
          tone: "default",
        },
      ];
    }

    if (user.role === "finance") {
      return [
        {
          label: "Paid Invoices",
          value: invoices.filter((invoice) => invoice.status === "paid").length.toString(),
          delta: "Cashflow tercatat otomatis",
          tone: "success",
        },
        {
          label: "Unpaid Invoices",
          value: invoices.filter((invoice) => invoice.status === "unpaid").length.toString(),
          delta: "Butuh follow-up minggu ini",
          tone: "warning",
        },
        {
          label: "Overdue",
          value: invoices.filter((invoice) => invoice.status === "overdue").length.toString(),
          delta: "Berisiko grace period / suspend",
          tone: "danger",
        },
        {
          label: "Collected",
          value: `Rp ${Math.round(
            database.payments.reduce((sum, payment) => sum + payment.amount, 0) / 1000,
          )}K`,
          delta: "Pembayaran tercatat realtime",
          tone: "default",
        },
      ];
    }

    if (user.role === "technician") {
      const mine = database.tickets.filter((ticket) => ticket.assignedTo === user.id);
      return [
        {
          label: "Open Queue",
          value: database.tickets.filter((ticket) => ticket.status === "open").length.toString(),
          delta: "Butuh assignment cepat",
          tone: "warning",
        },
        {
          label: "Assigned to Me",
          value: mine.filter((ticket) => ticket.status === "assigned").length.toString(),
          delta: "Fokus SLA hari ini",
          tone: "default",
        },
        {
          label: "Resolved",
          value: mine.filter((ticket) => ticket.status === "resolved").length.toString(),
          delta: "Outcome teknis tercapai",
          tone: "success",
        },
      ];
    }

    const customerInvoices = invoices.filter((invoice) => invoice.customerId === user.customerId);
    const customerTickets = database.tickets.filter((ticket) => ticket.customerId === user.customerId);
    const subscription = database.subscriptions.find(
      (entry) => entry.customerId === user.customerId,
    );

    return [
      {
        label: "Plan Aktif",
        value: subscription?.plan ?? "-",
        delta: subscriptionHint(subscription ?? database.subscriptions[0]),
        tone: subscription?.status === "active" ? "success" : "warning",
      },
      {
        label: "Invoice Bulan Ini",
        value: customerInvoices[0] ? `Rp ${Math.round(customerInvoices[0].amount / 1000)}K` : "-",
        delta: customerInvoices[0]?.status === "paid" ? "Sudah lunas" : "Menunggu pembayaran",
        tone: customerInvoices[0]?.status === "paid" ? "success" : "warning",
      },
      {
        label: "Open Tickets",
        value: customerTickets.filter((ticket) => ticket.status !== "resolved").length.toString(),
        delta: "Laporkan gangguan dari portal ini",
        tone: "default",
      },
    ];
  },

  async recentActivity(user: SessionUser) {
    await wait();
    const notifications = await notificationService.list(
      user.role === "admin" ? undefined : user.id,
    );
    return notifications.slice(0, 5);
  },
};

export function getDemoUsers(): User[] {
  return ensureMockDatabase().users;
}
