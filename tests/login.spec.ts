import { test, expect } from "./fixtures";

test("be in logged in state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Go to mesocycles")).toBeVisible();
});
