import { randomUUID } from "crypto";
import { test, expect } from "../fixtures";
import { getTotalDuration } from "$lib/util/MesocycleTemplate";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4173/mesocycles");
});

const mesocycleTemplate: MesocycleTemplate = {
  name: randomUUID(),
  caloricBalance: 0,
  startRIR: 3,
  RIRProgression: [
    { specificRIR: 3, cycles: 4 },
    { specificRIR: 2, cycles: 3 },
    { specificRIR: 1, cycles: 2 },
    { specificRIR: 0, cycles: 1 }
  ],
  exerciseSplit: [
    {
      name: "Upper",
      exercises: [
        {
          name: "Upper exercise 1",
          sets: 3,
          targetMuscleGroup: "Chest",
          repRangeStart: 10,
          repRangeEnd: 20,
          weightType: "Weighted"
        }
      ]
    },
    null
  ]
};
const editedMesocycleName = randomUUID();

test("create a sample mesocycle using API", async ({ page }) => {
  const createTemplateResponse = await page.request.post("/api/mesocycles/createTemplate", {
    data: { mesocycleTemplate },
    headers: { "content-type": "application/json" }
  });
  expect(createTemplateResponse.ok()).toBe(true);
});

test("edit the sample mesocycle", async ({ page }) => {
  await expect(page.getByRole("main")).toContainText(mesocycleTemplate.name);
  await page.getByRole("link", { name: mesocycleTemplate.name }).click();

  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page.locator("input[id='mesocycle-name']")).toHaveValue(mesocycleTemplate.name);
  await expect(page.locator("input[id='mesocycle-duration']")).toHaveValue(
    getTotalDuration(mesocycleTemplate.RIRProgression).toString()
  );

  await page.locator("input[id='mesocycle-name']").fill(editedMesocycleName);
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/editTemplate/split");

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/editTemplate/exercises");

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForURL("/mesocycles/editTemplate/extras");

  await page.getByRole("button", { name: "Edit mesocycle" }).click();
  await page.locator("#Success").getByTestId("close-modal-button").click();
});

test("edited changes should be reflected in the UI", async ({ page }) => {
  await expect(page.getByRole("main")).not.toContainText(mesocycleTemplate.name);
  await expect(page.getByRole("main")).toContainText(editedMesocycleName);
});
