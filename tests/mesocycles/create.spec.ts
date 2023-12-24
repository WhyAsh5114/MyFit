import { test, expect } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4173/mesocycles");
});

const randomMesocycleName = "create.spec.ts";

test("should successfully create a mesocycle", async ({ page }) => {
  await page.getByRole("link", { name: "Create new mesocycle" }).click();
  await page.getByRole("link", { name: "Start from scratch" }).click();

  // Basics
  await page.getByPlaceholder("Type here").fill(randomMesocycleName);
  await page.getByLabel("Mesocycle duration").fill("12");
  await page.getByLabel("Start RIR").selectOption("2");
  await page.getByLabel("Customize RIR progression").check();
  await page.getByLabel("2 RIR cycles").fill("8");
  await expect(page.getByTestId("Total 2 RIR cycles")).toContainText("8 cycles");
  await expect(page.getByTestId("Total 1 RIR cycles")).toContainText("3 cycles");
  await expect(page.getByTestId("Total 0 RIR cycles")).toContainText("1 cycles");
  await page.getByRole("button", { name: "Next" }).click();

  // Split
  await page.locator('[id="D1-workout-name"]').fill("Upper");
  await page.locator('[id="D1-workout-name"]').press("Tab");
  await page.locator('[id="is-D1-rest"]').press("Tab");
  await page.locator('[id="D2-workout-name"]').fill("Lower");
  await page.locator('[id="is-D3-rest"]').check();
  await page.locator('[id="D4-workout-name"]').fill("Upper");
  await page.locator('[id="D5-workout-name"]').fill("Lower");
  await page.locator('[id="is-D6-rest"]').check();
  await page.locator('[id="is-D7-rest"]').check();
  await page.getByRole("button", { name: "Next" }).click();

  // Add first exercise
  await page.getByRole("button", { name: "+ Add exercise" }).click();
  await page.getByLabel("Exercise name").fill("Upper Exercise 1");
  await page.getByLabel("Target muscle").selectOption("Chest");
  await page.getByLabel("Sets").fill("3");
  await page.getByPlaceholder("From").fill("10");
  await page.getByPlaceholder("From").press("Tab");
  await page.getByPlaceholder("To").fill("20");
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();

  // Check 1st exercise details
  await expect(page.getByTestId("exercise1-name")).toContainText("Upper Exercise 1");
  await expect(page.getByTestId("exercise1-sets-and-rep-range")).toContainText(
    "3 sets of 10 to 20 reps"
  );
  await expect(page.getByTestId("exercise1-target-muscle-group")).toContainText("Chest");

  // Copy from 1st Upper workout to 2nd Upper workout
  await page.getByRole("button", { name: "Copy" }).click();
  await page.getByLabel("Upper").nth(1).check();
  await page.getByRole("button", { name: "Paste" }).click();

  // Add 1st exercise to Lower1
  await page.getByLabel("Lower").first().check();
  await page.getByRole("button", { name: "+ Add exercise" }).click();
  await page.getByLabel("Exercise name").fill("Lower Exercise 1");
  await page.getByLabel("Target muscle").selectOption("Quads");
  await page.getByLabel("Sets").fill("4");
  await page.getByPlaceholder("From").fill("5");
  await page.getByPlaceholder("To").fill("10");
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();

  // Copy from Lower1 to Lower2
  await page.getByRole("button", { name: "Copy" }).click();
  await page.getByLabel("Lower").nth(1).check();
  await page.getByRole("button", { name: "Paste" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // Create the mesocycle
  await page.getByRole("button", { name: "Create mesocycle" }).click();
  await expect(page.locator("#Success")).toContainText("✕ Success Mesocycle created successfully");
  await page.locator("#Success").getByTestId("close-modal-button").click();
});

test("should show the created mesocycle", async ({ page }) => {
  await page.getByTestId("mesocycle-card").filter({ hasText: randomMesocycleName }).click();

  await expect(page.getByTestId("mesocycle-caloric-state")).toContainText(
    "Iso-caloric (Maintenance)"
  );
  await expect(page.getByTestId("mesocycle-split")).toContainText(
    "D1 Upper D2 Lower D3 Rest D4 Upper D5 Lower D6 Rest D7 Rest"
  );

  await expect(page.getByTestId("mesocycle-start-RIR")).toContainText("2 RIR");
  await expect(page.getByTestId("mesocycle-duration")).toContainText("12 cycles");
});

test("delete the created mesocycle", async ({ page }) => {
  await page.getByTestId("mesocycle-card").filter({ hasText: randomMesocycleName }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await page.locator('[id="Deleted\\ successfully"]').getByTestId("close-modal-button").click();
});

test("check if mesocycle deleted", async ({ page }) => {
  await expect(
    page.getByTestId("mesocycle-card").filter({ hasText: randomMesocycleName })
  ).not.toBeVisible();
});
