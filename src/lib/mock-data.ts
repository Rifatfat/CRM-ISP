import type { MockDatabase } from "@/lib/types";

const STORAGE_KEY = "crm-isp-demo-db";

export const seedDatabase: MockDatabase = {
  users: [
    {
      id: "user_admin",
      name: "Ayu Pratama",
      email: "admin@crmisp.local",
      passwordHash: "admin123",
      role: "admin",
      createdAt: "2026-01-10T08:00:00.000Z",
    },
    {
      id: "user_finance",
      name: "Raka Finance",
      email: "finance@crmisp.local",
      passwordHash: "finance123",
      role: "finance",
      createdAt: "2026-01-10T08:10:00.000Z",
    },
    {
      id: "user_technician",
      name: "Dion Tech",
      email: "technician@crmisp.local",
      passwordHash: "tech123",
      role: "technician",
      createdAt: "2026-01-10T08:20:00.000Z",
    },
    {
      id: "user_customer",
      name: "Budi Santoso",
      email: "customer@crmisp.local",
      passwordHash: "customer123",
      role: "customer",
      createdAt: "2026-01-10T08:30:00.000Z",
      customerId: "cust_001",
    },
  ],
  customers: [
    {
      id: "cust_001",
      name: "Budi Santoso",
      email: "customer@crmisp.local",
      address: "Jl. Cendana 12, Bandung",
      status: "active",
      createdAt: "2026-01-12T08:00:00.000Z",
    },
    {
      id: "cust_002",
      name: "PT Sinar Fiber",
      email: "billing@sinarfiber.co.id",
      address: "Jl. Asia Afrika 101, Bandung",
      status: "active",
      createdAt: "2026-02-01T09:20:00.000Z",
    },
    {
      id: "cust_003",
      name: "Nadia Permata",
      email: "nadia@permata.id",
      address: "Jl. Setiabudi 7, Cimahi",
      status: "suspended",
      createdAt: "2026-02-20T13:10:00.000Z",
    },
  ],
  subscriptions: [
    {
      id: "sub_001",
      customerId: "cust_001",
      plan: "Fiber Home 100 Mbps",
      price: 325000,
      status: "active",
      startDate: "2026-01-15",
      endDate: "2027-01-15",
    },
    {
      id: "sub_002",
      customerId: "cust_002",
      plan: "Business Pro 300 Mbps",
      price: 1250000,
      status: "grace_period",
      startDate: "2026-02-01",
      endDate: "2027-02-01",
    },
    {
      id: "sub_003",
      customerId: "cust_003",
      plan: "Fiber Home 50 Mbps",
      price: 275000,
      status: "suspended",
      startDate: "2026-02-21",
      endDate: "2027-02-21",
    },
  ],
  invoices: [
    {
      id: "inv_001",
      customerId: "cust_001",
      amount: 325000,
      status: "paid",
      dueDate: "2026-04-10",
      createdAt: "2026-04-01T07:00:00.000Z",
    },
    {
      id: "inv_002",
      customerId: "cust_002",
      amount: 1250000,
      status: "unpaid",
      dueDate: "2026-04-10",
      createdAt: "2026-04-01T07:15:00.000Z",
    },
    {
      id: "inv_003",
      customerId: "cust_003",
      amount: 275000,
      status: "overdue",
      dueDate: "2026-02-10",
      createdAt: "2026-02-01T07:15:00.000Z",
    },
  ],
  payments: [
    {
      id: "pay_001",
      invoiceId: "inv_001",
      amount: 325000,
      method: "transfer",
      paidAt: "2026-04-04T09:00:00.000Z",
    },
  ],
  tickets: [
    {
      id: "tic_001",
      customerId: "cust_001",
      issue: "Koneksi kadang drop saat jam sibuk malam hari.",
      status: "open",
      assignedTo: null,
      createdAt: "2026-04-14T10:30:00.000Z",
      updatedAt: "2026-04-14T10:30:00.000Z",
    },
    {
      id: "tic_002",
      customerId: "cust_002",
      issue: "Latency tinggi untuk akses dashboard internal kantor.",
      status: "assigned",
      assignedTo: "user_technician",
      createdAt: "2026-04-13T08:15:00.000Z",
      updatedAt: "2026-04-14T11:00:00.000Z",
    },
    {
      id: "tic_003",
      customerId: "cust_003",
      issue: "Perlu reaktivasi setelah pembayaran terlambat.",
      status: "resolved",
      assignedTo: "user_technician",
      createdAt: "2026-04-02T07:15:00.000Z",
      updatedAt: "2026-04-08T14:00:00.000Z",
    },
  ],
  notifications: [
    {
      id: "notif_001",
      userId: "user_admin",
      message: "3 ticket masih membutuhkan assignment teknisi.",
      type: "ticket",
      createdAt: "2026-04-15T01:00:00.000Z",
    },
    {
      id: "notif_002",
      userId: "user_finance",
      message: "Invoice PT Sinar Fiber melewati due date H+5.",
      type: "billing",
      createdAt: "2026-04-15T00:45:00.000Z",
    },
    {
      id: "notif_003",
      userId: "user_customer",
      message: "Pembayaran April berhasil dicatat. Terima kasih.",
      type: "reminder",
      createdAt: "2026-04-04T09:05:00.000Z",
    },
    {
      id: "notif_004",
      userId: "user_technician",
      message: "Ticket Business Pro 300 Mbps sudah di-assign ke Anda.",
      type: "ticket",
      createdAt: "2026-04-14T11:05:00.000Z",
    },
  ],
};

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedDatabase)) as MockDatabase;
}

export function getMockDatabase() {
  if (typeof window === "undefined") {
    return cloneSeed();
  }

<<<<<<< HEAD
  //const existing = window.localStorage.getItem(STORAGE_KEY);
  let existing: string | null = null;

  if (typeof window !== "undefined") {
    existing = window.localStorage.getItem(STORAGE_KEY);
  }

  if (!existing) {
    const seeded = cloneSeed();
    //window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
=======
  const existing = window.localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    const seeded = cloneSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
>>>>>>> 06caa69 (init: clean CRM ISP frontend)
    return seeded;
  }

  return JSON.parse(existing) as MockDatabase;
}

export function saveMockDatabase(database: MockDatabase) {
  if (typeof window === "undefined") {
    return;
  }

<<<<<<< HEAD
  //window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  if (typeof window !== "undefined") {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  }
=======
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
>>>>>>> 06caa69 (init: clean CRM ISP frontend)
}

export function ensureMockDatabase() {
  return getMockDatabase();
}
