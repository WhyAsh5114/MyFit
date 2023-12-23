import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/mesocycles");
});

test("create prebuilt PPL mesocycle", async ({ page }) => {
  await page.getByRole("link", { name: "Create new mesocycle" }).click();
  await page.getByRole("link", { name: "Use common mesocycles Start" }).click();
  await page.getByRole("button", { name: "Pull Push Legs Pull A Push A" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/newTemplate/split");
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/newTemplate/exercises");
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/newTemplate/extras");
  await page.getByRole("button", { name: "Create mesocycle" }).click();
  await page.locator("#Success").getByTestId("close-modal-button").click();
});

test("activate the newly created mesocycle", async ({ page }) => {
  await page.getByRole("link", { name: "Pull Push Legs 6 cycles Pull" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.locator('[id="Started\\ successfully"]').getByTestId("close-modal-button").click();
});

test("check if mesocycle is activated", async ({ page }) => {
  await expect(page.getByTestId("active-mesocycle-name")).toContainText("Pull Push Legs");
  await page.getByRole("link", { name: "Pull Push Legs 0/36 workouts" }).click();
  await expect(page.getByTestId("mesocycle-end-date")).toContainText("Active");
  await expect(page.getByRole("button", { name: "Stop mesocycle" })).toBeVisible();
});
