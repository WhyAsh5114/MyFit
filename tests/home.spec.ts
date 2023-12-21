import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(/MyFit/);
});

test("login redirects to login page", async ({ page }) => {
  await page.getByText("Login to the app").click();
  await expect(page).toHaveURL(/.*\/login/);
});

test("callback URL is set when not logged in", async ({ page }) => {
  await page.getByRole("link", { name: "Mesocycles" }).click();
  await page.waitForURL("/login?callbackURL=/mesocycles");
});
