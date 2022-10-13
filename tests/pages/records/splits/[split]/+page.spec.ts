import { test, expect, getFormattedDate } from '../../../../fixtures.js';

test('should load split data correctly', async ({ extraSplitsCreatedPage, split }) => {
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

test('should open correct modals', async ({ extraSplitsCreatedPage, extraSplits }) => {
    const page = extraSplitsCreatedPage;
    await page.goto('/records/splits');

    await Promise.all([
        page.locator('h2', { hasText: extraSplits[0].name }).click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain(`/records/splits/${extraSplits[0].name.replaceAll(' ', '%20')}`);

    const progressionRangeInput = page.locator('[data-test-id=progression-range-input]');
    let progressionValue = parseFloat(await progressionRangeInput.inputValue());
    if (progressionValue < 25) {
        progressionValue += 2.5;
    } else {
        progressionValue -= 2.5;
    }
    await progressionRangeInput.fill(progressionValue.toString());

    const saveSplitModalButton = page.locator('[data-test-id=save-split-modal-button]');
    const cancelSaveModalButton = page.locator('[data-test-id=cancel-save-modal-button]');
    await expect(saveSplitModalButton).not.toBeVisible();

    const saveButton = page.locator('[data-test-id=save-button]');
    await expect(saveButton).toHaveText('Review changes');
    await saveButton.click();

    await expect(saveSplitModalButton).toBeVisible();
    await cancelSaveModalButton.click();
    await expect(cancelSaveModalButton).not.toBeVisible();

    const deleteButton = page.locator('[data-test-id=delete-split-button]');
    const deleteSplitModalButton = page.locator('[data-test-id=delete-split-modal-button]');
    const cancelDeleteModalButton = page.locator('[data-test-id=cancel-delete-modal-button]');

    await expect(deleteSplitModalButton).not.toBeVisible();
    await deleteButton.click();
    await expect(deleteSplitModalButton).toBeVisible();

    await cancelDeleteModalButton.click();
    await expect(cancelDeleteModalButton).not.toBeVisible();
});

test('should delete split (extraSplits[1])', async ({ extraSplitsCreatedPage, extraSplits }) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${extraSplits[1].name}`);

    const deleteButton = page.locator('[data-test-id=delete-split-button]');
    await deleteButton.click();

    const deleteSplitModalButton = page.locator('[data-test-id=delete-split-modal-button]');
    await Promise.all([
        deleteSplitModalButton.click(),
        page.waitForRequest('/api/splits/deleteSplit'),
        page.waitForResponse((res) => res.ok() === true)
    ]);

    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Success');
    await expect(page.locator('li', { hasText: 'Split deleted successfully' })).toBeVisible();

    await Promise.all([
        page.locator('[data-test-id=close-modal-button]').click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain('/records/splits');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect(await splitButtons.allTextContents()).not.toContain(extraSplits[1].name);
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
