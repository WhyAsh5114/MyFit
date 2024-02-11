import { commonSplits } from "$lib/commonMesocycles";
import { test, expect } from "../fixtures";

const commonExerciseSplit = commonSplits[1];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.request.post("/api/exerciseSplits", {
    data: JSON.stringify(commonExerciseSplit)
  });
  await page.getByRole("link", { name: "Exercise splits" }).click();
  await expect(page.getByRole("main")).toContainText("Yoked split");
});

test("edit the created split", async ({ page }) => {
  await page.getByRole("link", { name: "Yoked split 75 sets Back," }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("link", { name: "edit exercise split" }).click();
  await page.getByPlaceholder("Type here").fill("Yoked split (edited)");
  await page.locator("#mark-day4-as-rest").check();
  await page.locator("#mark-day2-as-rest").check();
  await page.getByRole("button", { name: "Select exercises" }).click();
  await page.getByRole("button", { name: "Yes, continue" }).click();
  await page.getByRole("button", { name: "Update exercise split" }).click();
  await page.locator("#Success").getByTestId("close-modal-button").click();
  await page.getByRole("link", { name: "Yoked split (edited) 45 sets" }).click();
  await expect(page.getByRole("main")).toContainText("Sets per cycle 45");
});
