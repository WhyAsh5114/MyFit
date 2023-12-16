import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MyFit/);
});

test("login redirects to login page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Login to the app").click();
  await expect(page).toHaveURL(/.*\/login/)
})
