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

test("show some stats", async ({ page }) => {
  await page.getByRole("link", { name: "Pull Push Legs" }).click();
  await page.waitForURL(/exerciseSplits\/view/);
  await expect(page.getByText("Split name Pull Push Legs")).toBeVisible();
  await expect(page.getByText("Sets per cycle 68")).toBeVisible();
  await expect(page.getByText("Avg. sets per day 11.33")).toBeVisible();

  await page.getByLabel("Exercises").check();
  await expect(page.getByTestId("split-exercises-table")).toContainText(
    "Pull up BW 3 sets of 5 to 15 reps Back (vertical pulls)"
  );
});
