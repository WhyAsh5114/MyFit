import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/mesocycles");
});

const randomMesocycleName = "active.spec.ts";

test("create prebuilt PPL mesocycle", async ({ page }) => {
  await page.getByRole("link", { name: "Create new mesocycle" }).click();
  await page.getByRole("link", { name: "Use common mesocycles Start" }).click();
  await page.getByRole("button", { name: "Pull Push Legs Pull A Push A" }).click();
  await page.getByPlaceholder("Type here").fill(randomMesocycleName);
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
  await page.getByTestId("mesocycle-card").filter({ hasText: randomMesocycleName }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.locator('[id="Started\\ successfully"]').getByTestId("close-modal-button").click();
});

test("check if mesocycle is activated", async ({ page }) => {
  await expect(page.getByTestId("active-mesocycle-name")).toContainText(randomMesocycleName);
  await page.getByTestId("active-mesocycle-card").filter({ hasText: randomMesocycleName }).click();
  await expect(page.getByTestId("mesocycle-end-date")).toContainText("Active");
  await expect(page.getByRole("button", { name: "Stop mesocycle" })).toBeVisible();
});

test("stop active mesocycle", async ({ page }) => {
  await page.getByTestId("active-mesocycle-card").filter({ hasText: randomMesocycleName }).click();
  await page.getByRole("button", { name: "Stop mesocycle" }).click();
  await page.getByRole("button", { name: "Yes, stop" }).click();
  await page.locator("#Success").getByTestId("close-modal-button").click();
});

test("make sure no active mesocycle", async ({ page }) => {
  await expect(page.getByText("No mesocycle active Start one")).toBeVisible();
});

test("delete the sample mesocycle", async ({ page }) => {
  await page.getByTestId("mesocycle-card").filter({ hasText: randomMesocycleName }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await page.locator('[id="Deleted\\ successfully"]').getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).not.toContainText(randomMesocycleName);
});
