import { commonSplits } from "$lib/commonMesocycles";
import { dateFormatter } from "$lib/utils/common";
import { expect, test } from "../fixtures";
import { basicMesocycle } from "./basicMesocycle";

const commonExerciseSplit = commonSplits[0];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.request.post("/api/exerciseSplits", {
    data: JSON.stringify(commonExerciseSplit)
  });
  await page.getByRole("link", { name: "Exercise splits" }).click();
  await page.getByRole("link", { name: "Pull Push Legs 68 sets Pull A" }).click();
  await page.waitForURL(/exerciseSplits\/view/);

  const exerciseSplitId = page.url().split("/").at(-1) as string;
  const requestBody: { currentMesocycle: Omit<Mesocycle, "startTimestamp">; startNow: boolean } = {
    currentMesocycle: { ...basicMesocycle, exerciseSplitId },
    startNow: true
  };
  await page.request.post("/api/mesocycles", {
    data: JSON.stringify(requestBody)
  });
  await page.getByRole("link", { name: "Mesocycles" }).click();
});

test("delete the created mesocycle", async ({ page }) => {
  await page
    .getByRole("link", {
      name: `MesocycleName ${dateFormatter(Number(new Date()), false)} Pull Push Legs Iso`
    })
    .click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator("#Success")).toContainText("✕ Success Mesocycle deleted successfully");
  await page.getByTestId("close-modal-button").click();
  await expect(page.getByRole("main")).toContainText(
    "No mesocycles created Create one by clicking the button below"
  );
});
