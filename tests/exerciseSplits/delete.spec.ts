import { commonSplits } from "$lib/commonMesocycles";
import { test, expect } from "../fixtures";

const commonExerciseSplit = commonSplits[0];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.request.post("/api/exerciseSplits", {
    data: JSON.stringify(commonExerciseSplit)
  });
  await page.getByRole("link", { name: "Exercise splits" }).click();
  await expect(page.getByRole("main")).toContainText("Pull Push Legs");
});

test("delete the created split", async ({ page }) => {
  await page.getByRole("link", { name: "Pull Push Legs 68 sets Pull A" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("paragraph")).toContainText(
    "Are you sure you want to delete the split: Pull Push Legs"
  );
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page.locator("#Success")).toContainText(
    "✕ Success Exercise split deleted successfully"
  );
  await page.locator("#Success").getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).toContainText(
    "No splits created Create one by clicking the button below"
  );
});
