import { expect, test } from "@playwright/test";

test("admin can sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /masuk ke dashboard/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/role-focused workflow/i)).toBeVisible();
});

test("customer can submit a support ticket from the portal", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /budi santoso/i }).click();
  await page.getByRole("button", { name: /masuk ke dashboard/i }).click();
  await page.getByRole("link", { name: /ticket saya/i }).click();
  await page.getByLabel(/jelaskan issue/i).fill(
    "Internet tidak stabil sejak sore dan perlu dicek teknisi.",
  );
  await page.getByRole("button", { name: /submit ticket/i }).click();
  await expect(page.getByText(/internet tidak stabil sejak sore/i)).toBeVisible();
});
