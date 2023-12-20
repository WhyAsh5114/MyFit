import { test, expect } from "./fixtures";

test("goto logged in page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Go to mesocycles")).toBeVisible();
});
