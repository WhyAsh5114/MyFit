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

test("validate structure errors", async ({ page }) => {
  await page.getByRole("link", { name: "Create new split" }).click();
  await page.getByRole("link", { name: "Start from scratch Create a" }).click();
  await page.getByRole("link", { name: "new exercise split" }).click();

  await page.getByRole("button", { name: "Select exercises" }).click();
  await expect(page.locator("h3")).toContainText("Structure");

  await page.getByPlaceholder("Type here").fill("SplitName");
  await page.locator("#structure-form").getByRole("button").first().click({
    clickCount: 7
  });
  await page.getByRole("button", { name: "Select exercises" }).click();
  await expect(page.locator("#Error")).toContainText(
    "Add at least one workout to the exercise split"
  );
  await page.locator("#Error").getByTestId("close-modal-button").click();

  await page.locator("#structure-form").getByRole("button").nth(1).click();
  await page.locator("#mark-day1-as-rest").check();
  await page.getByRole("button", { name: "Select exercises" }).click();
  await expect(page.locator("#Error")).toContainText(
    "Add at least one workout to the exercise split"
  );
  await page.locator("#Error").getByTestId("close-modal-button").click();

  await page.locator("#mark-day1-as-rest").uncheck();
  await page.locator("#day1-workout-name").fill("ExerciseSplit1");
  await page.locator("#structure-form").getByRole("button").nth(1).click();
  await page.getByRole("button", { name: "Select exercises" }).click();
  await expect(page.locator("h3")).toContainText("Structure");

  await expect(page.locator("#structure-form")).toContainText("Day 2");
  await page.locator("#mark-day2-as-rest").check();
  await page.getByRole("button", { name: "Select exercises" }).click();
  await expect(page.locator("h3")).toContainText("Exercises");
});

test("test exercise operations (add, delete, edit, move, BW, data display)", async ({ page }) => {
  await page.getByRole("link", { name: "Create new split" }).click();
  await page.getByRole("link", { name: "Start from scratch Create a" }).click();
  await page.getByRole("link", { name: "new exercise split" }).click();
  await page.getByPlaceholder("Type here").fill("Upper Lower");
  await page.locator("#day1-workout-name").fill("Upper");
  await page.locator("#day2-workout-name").fill("Lower");
  await page.locator("#mark-day3-as-rest").check();
  await page.locator("#day4-workout-name").fill("Upper");
  await page.locator("#day5-workout-name").fill("Lower");
  await page.locator("#mark-day6-as-rest").check();
  await page.locator("#mark-day7-as-rest").check();
  await page.getByRole("button", { name: "Select exercises" }).click();

  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByLabel("Exercise name").fill("Upper 1 Exercise 1");
  await page.getByLabel("Muscle group Select a muscle").selectOption("Chest");
  await page.getByLabel("Sets", { exact: true }).fill("3");
  await page.getByPlaceholder("From").fill("10");
  await page.getByPlaceholder("To").fill("20");
  await page.getByLabel("Notes").fill("Upper 1 Exercise 1 Note");
  await page.getByRole("button", { name: "add exercise", exact: true }).click();
  await expect(page.getByTestId("exercise1-card")).toContainText(
    "Upper 1 Exercise 1 3 sets of 10 to 20 reps Chest Upper 1 Exercise 1 Note"
  );

  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByLabel("Exercise name").fill("Upper 1 Exercise 2");
  await page.getByLabel("Muscle group Select a muscle").selectOption("Back (vertical pulls)");
  await page.getByLabel("Sets", { exact: true }).fill("5");
  await page.getByPlaceholder("From").fill("5");
  await page.getByPlaceholder("To").fill("10");
  await page.getByLabel("Involves bodyweight?  No").check();
  await page.getByRole("button", { name: "add exercise", exact: true }).click();
  await expect(page.getByTestId("exercise2-card")).toContainText(
    "Upper 1 Exercise 2 BW 5 sets of 5 to 10 reps Back (vertical pulls)"
  );

  await expect(page.getByTestId("split-exercises-table")).toContainText(
    "Upper 1 Exercise 1 3 sets of 10 to 20 reps Chest Upper 1 Exercise 1 Note Upper 1 Exercise 2 BW 5 sets of 5 to 10 reps Back (vertical pulls)"
  );
  await page.getByTestId("exercise1-card").locator("summary").click();
  await page.getByTestId("exercise1-card").getByLabel("Delete exercise").click();
  await expect(page.getByTestId("split-exercises-table")).not.toContainText(
    "Upper 1 Exercise 1 3 sets of 10 to 20 reps Chest"
  );

  await page.getByTestId("exercise1-menu-button").click();
  await page.getByLabel("Edit exercise").click();
  await page.getByLabel("Exercise name").fill("Upper 1 Exercise 1");
  await page.getByLabel("Sets", { exact: true }).fill("3");
  await page.getByLabel("Muscle group Select a muscle").selectOption("Back (horizontal pulls)");
  await page.getByLabel("Notes").fill("Upper 1 Exercise 1 Note (edited)");
  await page.getByRole("button", { name: "edit exercise", exact: true }).click();
  await expect(page.getByTestId("exercise1-card")).toHaveCount(1); // Wait for edit to complete and update UI
  await expect(page.getByTestId("exercise1-card")).toContainText(
    "Upper 1 Exercise 1 BW 3 sets of 5 to 10 reps Back (horizontal pulls) Upper 1 Exercise 1 Note (edited)"
  );

  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByLabel("Exercise name").fill("Upper 1 Exercise 2");
  await page.getByLabel("Muscle group Select a muscle").selectOption("Chest");
  await page.getByLabel("Sets", { exact: true }).fill("3");
  await page.getByPlaceholder("From").fill("5");
  await page.getByPlaceholder("To").fill("10");
  await page.getByRole("button", { name: "add exercise", exact: true }).click();
  await expect(page.getByTestId("exercise1-card")).toContainText(
    "Upper 1 Exercise 1 BW 3 sets of 5 to 10 reps Back (horizontal pulls) Upper 1 Exercise 1 Note (edited)"
  );
  await expect(page.getByTestId("exercise2-card")).toContainText(
    "Upper 1 Exercise 2 3 sets of 5 to 10 reps Chest"
  );
  await expect(page.getByTestId("split-exercises-table")).toContainText(
    "Upper 1 Exercise 1 BW 3 sets of 5 to 10 reps Back (horizontal pulls) Upper 1 Exercise 1 Note (edited) Upper 1 Exercise 2 3 sets of 5 to 10 reps Chest"
  );
  await page.getByTestId("exercise2-card").locator("summary").click();
  await page.getByTestId("exercise2-card").getByLabel("Move exercise up").click();
  await page.getByTestId("exercise1-card").locator("summary").click();
  await expect(page.getByTestId("exercise1-card")).toContainText(
    "Upper 1 Exercise 2 3 sets of 5 to 10 reps Chest"
  );
  await expect(page.getByTestId("exercise2-card")).toContainText(
    "Upper 1 Exercise 1 BW 3 sets of 5 to 10 reps Back (horizontal pulls) Upper 1 Exercise 1 Note (edited)"
  );
  await expect(page.getByTestId("split-exercises-table")).toContainText(
    "Upper 1 Exercise 2 3 sets of 5 to 10 reps Chest Upper 1 Exercise 1 BW 3 sets of 5 to 10 reps Back (horizontal pulls) Upper 1 Exercise 1 Note (edited)"
  );
});
