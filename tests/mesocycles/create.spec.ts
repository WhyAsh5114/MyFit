import { commonSplits } from "$lib/commonMesocycles";
import { test, expect } from "../fixtures";

const commonExerciseSplit = commonSplits[0];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.request.post("/api/exerciseSplits", {
    data: JSON.stringify(commonExerciseSplit)
  });
  await page.getByRole("link", { name: "Mesocycles" }).click();
});

test("show no mesocycles created", async ({ page }) => {
  await expect(page.getByRole("main")).toContainText("No mesocycles created");
  await expect(page.getByRole("main")).toContainText("Create one by clicking the button below");
});

test("create mesocycle from UI", async ({ page }) => {
  await page.getByRole("link", { name: "Create new mesocycle" }).click();
  await page.getByRole("link", { name: "new mesocycle" }).click();
  await page.getByPlaceholder("Type here").fill("MesocycleName");
  await page.getByLabel("Caloric state Hypo-caloric (").selectOption("1");
  await page.getByLabel("Start RIR 4 RIR3 RIR2 RIR1").selectOption("2");
  await page.getByLabel("Mesocycle duration").fill("11");
  await page.getByRole("button", { name: "Select exercise split" }).click();
  await page.getByRole("button", { name: "Pull Push Legs 68 sets Pull A" }).click();
  await page.getByRole("link", { name: "Select exercise starting" }).click();
  await page.getByRole("link", { name: "Select specializations" }).click();
  await page.getByRole("button", { name: "Create mesocycle" }).click();
  await expect(page.locator("#Success")).toContainText("✕ Success Mesocycle created successfully");
  await page.getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).toContainText(
    "MesocycleName Not used Pull Push Legs Hyper-caloric"
  );
});

test("mesocycle creation validation logic", async ({ page }) => {
  await page.getByRole("link", { name: "Create new mesocycle" }).click();
  await page.getByRole("link", { name: "new mesocycle" }).click();
  await page.getByPlaceholder("Type here").fill("MesocycleName");
  await page.getByLabel("Caloric state Hypo-caloric (").selectOption("1");
  await page.getByLabel("Mesocycle duration").fill("11");

  await page.getByLabel("Customize RIR progression").check();
  await expect(page.getByLabel("3 RIR", { exact: true })).toHaveValue("4");
  await expect(page.getByLabel("2 RIR", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("1 RIR", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("0 RIR", { exact: true })).toHaveValue("1");
  await page.getByLabel("Start RIR 4 RIR3 RIR2 RIR1").selectOption("2");
  await expect(page.getByLabel("2 RIR", { exact: true })).toHaveValue("5");
  await expect(page.getByLabel("1 RIR", { exact: true })).toHaveValue("5");
  await expect(page.getByLabel("0 RIR", { exact: true })).toHaveValue("1");
  await page.getByLabel("Customize RIR progression").uncheck();

  await page.getByRole("button", { name: "Select exercise split" }).click();
  await page.getByPlaceholder("Type the name here").click();
  await page.getByPlaceholder("Type the name here").fill("a");
  await expect(page.getByRole("main")).toContainText(
    "No splits found You haven't created a split with name containing a"
  );
  await page.getByPlaceholder("Type the name here").click();
  await page.getByPlaceholder("Type the name here").fill("pull");
  await expect(page.getByRole("main")).toContainText(
    "Pull Push Legs 68 sets Pull APush ALegs APull BPush BLegs B"
  );
  await page.getByRole("button", { name: "Pull Push Legs 68 sets Pull A" }).click();

  await page.getByRole("link", { name: "Select exercise starting" }).click();
  await page.getByRole("link", { name: "Select specializations" }).click();
  await page.getByLabel("Use specialization").check();
  await page.getByRole("button", { name: "Create mesocycle" }).click();
  await expect(page.locator("#Error")).toContainText(
    "✕ Error Add at least one specialization, or disable it to continue"
  );
  await page.getByTestId("close-modal-button").click();
  await page.getByLabel("Select a muscle group to").selectOption("Chest");
  await page.getByRole("button", { name: "Primary" }).click();
  await expect(page.getByRole("button", { name: "Chest" })).toBeVisible();
  await page.getByLabel("Select a muscle group to").selectOption("Side delts");
  await page.getByRole("button", { name: "Secondary" }).click();
  await page.locator("#secondary-specializations").check();
  await expect(page.getByRole("button", { name: "Side delts" })).toBeVisible();
  await page.getByLabel("Start immediately").check();
  await page.getByLabel("Start immediately").uncheck();
  await page.getByRole("button", { name: "Create mesocycle" }).click();
  await expect(page.locator("#Success")).toContainText("✕ Success Mesocycle created successfully");
  await page.getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).toContainText(
    "MesocycleName Not used Pull Push Legs Hyper-caloric Chest Side delts"
  );
});

// TODO tests: start immediately logic, Read, Update, Delete
