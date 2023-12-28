import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Exercise splits" }).click();
});

test("show no splits created", async ({ page }) => {
  await expect(page.getByRole("main")).toContainText("No splits created");
  await expect(page.getByRole("main")).toContainText("Create one by clicking the button below");
});

test("create split from UI", async ({ page }) => {
  await page.getByRole("link", { name: "Create new split" }).click();
  await page.getByRole("link", { name: "Start from scratch Create a" }).click();
  await page.getByRole("link", { name: "new exercise split" }).click();

  await page.getByPlaceholder("Type here").fill("Full body");
  await page.locator("#day1-workout-name").fill("Full body");
  await page.locator("#mark-day2-as-rest").check();
  await page.locator("#mark-day3-as-rest").check();
  await page.locator("#day4-workout-name").fill("Full body");
  await page.locator("#mark-day5-as-rest").check();
  await page.locator("#mark-day6-as-rest").check();
  await page.locator("#mark-day7-as-rest").check();
  await page.getByRole("button", { name: "Select exercises" }).click();

  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByLabel("Exercise name").fill("Exercise 1");
  await page.getByLabel("Muscle group Select a muscle").selectOption("Chest");
  await page.getByLabel("Sets", { exact: true }).fill("1");
  await page.getByPlaceholder("From").fill("1");
  await page.getByPlaceholder("To").fill("2");
  await page.getByRole("button", { name: "add exercise", exact: true }).click();
  await page.getByRole("button", { name: "Copy" }).click();
  await page.getByLabel("Full body").nth(1).check();
  await page.getByRole("button", { name: "Paste" }).click();
  await page.getByRole("button", { name: "Create exercise split" }).click();
  await expect(page.locator("#Success")).toContainText(
    "✕ Success Exercise split created successfully"
  );
  await page.locator("#Success").getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).toContainText("Full body");
});
