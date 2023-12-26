import { test, expect } from "./fixtures";

test("be in logged in state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).not.toContainText("Log in to use the app");
});
