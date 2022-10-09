import { test, expect, getFormattedDate } from '../../../../fixtures.js';

test('should load split data correctly', async ({ extraSplitsCreatedPage, extraSplits, split }) => {
    const page = extraSplitsCreatedPage;
    await page.goto('/records/splits');

    await Promise.all([
        page.locator('h2', { hasText: split.name }).click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain(`/records/splits/${split.name}`);

    const splitNameInput = page.locator('[data-test-id=split-name-input]');
    const workoutNames = page.locator('[data-test-id=schedule-inputs-container] input');
    const progressionRangeInput = page.locator('[data-test-id=progression-range-input]');
    const splitStatusInput = page.locator('[data-test-id=split-status-input]');
    const dateCreatedDiv = page.locator('[data-test-id=date-created-div]');

    await expect(splitNameInput).toHaveValue(split.name);
    split.schedule.forEach(async (dayWorkout, i) => {
        await expect(workoutNames.nth(i)).toHaveValue(dayWorkout);
    });
    await expect(progressionRangeInput).toHaveValue(split.progressiveOverload.toString());
    expect(await splitStatusInput.isChecked()).toStrictEqual(false);
    await expect(dateCreatedDiv).toHaveText(getFormattedDate(split.timeCreated));
});

// TODO
/*
    modal checks (save and delete)
    reset changes checks
    activeSplit changes checks
    workouts check
    modify workouts check
    all rest days not allowed check
    success modal (split modified successfully)
    recheck split saved or not
    change workouts
    go in modify workouts and cross check workout data
*/
