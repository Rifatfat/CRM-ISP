import { beforeEach, describe, expect, it } from "vitest";

import { invoiceService, paymentService, ticketService } from "@/lib/services";

describe("CRM mock services", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("blocks duplicate invoices for the same customer and month", async () => {
    await expect(
      invoiceService.generate({
        customerId: "cust_001",
        month: "2026-04",
      }),
    ).rejects.toThrow("Invoice untuk customer dan periode ini sudah ada.");
  });

  it("marks an invoice as paid after recording payment", async () => {
    const invoicesBefore = await invoiceService.list();
    const targetInvoice = invoicesBefore.find((invoice) => invoice.id === "inv_002");

    expect(targetInvoice?.status).toBe("overdue");

    await paymentService.create({
      invoiceId: "inv_002",
      amount: 1250000,
      method: "transfer",
    });

    const invoicesAfter = await invoiceService.list();
    const paidInvoice = invoicesAfter.find((invoice) => invoice.id === "inv_002");

    expect(paidInvoice?.status).toBe("paid");
  });

  it("refuses to resolve a ticket before it is assigned", async () => {
    await expect(
      ticketService.update("tic_001", {
        status: "resolved",
      }),
    ).rejects.toThrow("Ticket harus assigned sebelum dapat di-resolve.");
  });
});
