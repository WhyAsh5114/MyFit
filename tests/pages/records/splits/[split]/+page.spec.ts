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
    await deleteSplitModalButton.click();

    expect(
        await page.locator('[data-test-id=modal-messages-list] li').allTextContents()
    ).toStrictEqual(['Split deleted successfully']);

    await Promise.all([
        page.locator('[data-test-id=close-modal-button]').click(),
        page.waitForNavigation()
    ]);
    expect(page.url()).toContain('/records/splits');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect(await splitButtons.allTextContents()).not.toContain(extraSplits[1].name);
});

test('should give error and not save split if all rest days', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${extraSplits[1].name}`);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
        const dayWorkoutInput = page.locator(`[data-test-id=${days[i]}-workout-input]`);
        await expect(dayWorkoutInput).toBeEditable();
        await dayWorkoutInput.fill('');
    }
    const saveButton = page.locator('[data-test-id=save-button]');
    await saveButton.click();

    await expect(page.locator('[data-test-id=modifyingModal-title]')).toHaveText('Review changes');
    const saveSplitModalButton = page.locator('[data-test-id=save-split-modal-button]');
    await saveSplitModalButton.click();

    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Error');
    expect(await page.locator('[data-test-id=modal-messages-list] li').allTextContents()).toEqual([
        'Should have at least one unique workout'
    ]);
});

test('should reset changes appropriately', async ({
    extraSplitsCreatedPage,
    extraSplits,
    split
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${split.name}`);

    const splitNameInput = page.locator('[data-test-id=split-name-input]');
    const overloadFrequencySelector = page.locator('[data-test-id=overload-frequency-selector]');
    const progressionRangeInput = page.locator('[data-test-id=progression-range-input]');
    const splitStatusInput = page.locator('[data-test-id=split-status-input]');

    await expect(splitNameInput).toBeEditable();
    await splitNameInput.fill('Random split name');
    await overloadFrequencySelector.selectOption('/month');
    await progressionRangeInput.fill(
        (parseFloat(await progressionRangeInput.inputValue()) + 2.5).toString()
    );
    await splitStatusInput.check();

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
        const dayWorkoutInput = page.locator(`[data-test-id=${days[i]}-workout-input]`);
        await expect(dayWorkoutInput).toBeEditable();
        await dayWorkoutInput.fill(`Random${i}`);
    }
    let scheduleChangeString = 'Schedule\n';
    for (let i = 0; i < 7; i++) {
        scheduleChangeString += `${days[i]}: ${split.schedule[i]} -> Random${i}\n`;
    }

    await page.locator('[data-test-id=save-button]').click();
    expect(
        await page.locator('[data-test-id=modifyingModal-messages-list] li').allTextContents()
    ).toEqual([
        `Name\n${split.name} -> Random split name\n\t`,
        scheduleChangeString + '\t',
        `Overload frequency\n${split.overloadFrequency} -> /month\n\t`,
        `Overload value\n${split.progressiveOverload}% -> ${split.progressiveOverload + 2.5}%\n\t`,
        `Active split\n${extraSplits[1].name} -> Random split name`
    ]);

    await page.locator('[data-test-id=cancel-save-modal-button]').click();
    await page.locator('[data-test-id=reset-changes-button]').click();

    expect(await splitNameInput.inputValue()).toBe(split.name);
    expect(await overloadFrequencySelector.inputValue()).toBe(split.overloadFrequency);
    expect(await progressionRangeInput.inputValue()).toBe(split.progressiveOverload.toString());
    expect(await splitStatusInput.isChecked()).toBe(false);
    for (let i = 0; i < 7; i++) {
        const dayWorkoutInput = page.locator(`[data-test-id=${days[i]}-workout-input]`);
        expect(await dayWorkoutInput.inputValue()).toBe(split.schedule[i]);
    }

    await expect(page.locator('[data-test-id=save-button]')).toHaveText('Back');
});

test('should change activeSplit correctly', async ({
    extraSplitsCreatedPage,
    extraSplits,
    split
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${extraSplits[1].name}`);

    const splitStatusInput = page.locator('[data-test-id=split-status-input]');
    const saveButton = page.locator('[data-test-id=save-button]');
    const modifyingModalMessages = page.locator('[data-test-id=modifyingModal-messages-list] li');
    const saveSplitModalButton = page.locator('[data-test-id=save-split-modal-button]');

    expect(await splitStatusInput.isChecked()).toBe(true);
    await splitStatusInput.uncheck();
    await saveButton.click();
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Active split\n${extraSplits[1].name} -> None`
    ]);
    await Promise.all([
        saveSplitModalButton.click(),
        page.waitForResponse('/api/splits/modifySplit')
    ]);
    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Success');
    await Promise.all([
        page.locator('[data-test-id=close-modal-button]').click(),
        page.waitForNavigation()
    ]);
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=no-active-split]')).toHaveText('No active split');

    await page.goto(`/records/splits/${extraSplits[0].name}`);
    expect(await splitStatusInput.isChecked()).toBe(false);
    await splitStatusInput.check();
    await saveButton.click();
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Active split\nNone -> ${extraSplits[0].name}`
    ]);
    await saveSplitModalButton.click();
    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Success');
    expect(
        await page.locator('[data-test-id=modal-messages-list] li').allTextContents()
    ).toStrictEqual(['Split saved successfully']);
    await page.locator('[data-test-id=close-modal-button]').click();
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=active-split]')).toHaveText(extraSplits[0].name);

    await page.goto(`/records/splits/${split.name}`);
    expect(await splitStatusInput.isChecked()).toBe(false);
    await splitStatusInput.check();
    await saveButton.click();
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Active split\n${extraSplits[0].name} -> ${split.name}`
    ]);
    await saveSplitModalButton.click();
    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Success');
    expect(
        await page.locator('[data-test-id=modal-messages-list] li').allTextContents()
    ).toStrictEqual(['Split saved successfully']);
    await page.locator('[data-test-id=close-modal-button]').click();
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=active-split]')).toHaveText(split.name);

    const splitNameInput = page.locator('[data-test-id=split-name-input]');

    await page.goto(`/records/splits/${split.name}`);
    await splitNameInput.fill(`${split.name} v2`);
    expect(await splitStatusInput.isChecked()).toBe(true);
    await splitStatusInput.uncheck();
    await saveButton.click();
    await expect(page.locator('[data-test-id=modifyingModal-title]')).toHaveText('Review changes');
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Name\n${split.name} -> ${split.name} v2\n\t`,
        `Active split\n${split.name} -> None`
    ]);
    await saveSplitModalButton.click();
    await page.locator('[data-test-id=close-modal-button]').click();
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=no-active-split]')).toHaveText('No active split');

    await page.goto('/records/splits');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect((await splitButtons.allTextContents()).includes(`${split.name} v2`)).toBe(true);

    await page.goto(`/records/splits/${extraSplits[0].name}`);
    await splitNameInput.fill(`${extraSplits[0].name} v2`);
    expect(await splitStatusInput.isChecked()).toBe(false);
    await splitStatusInput.check();
    await saveButton.click();
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Name\n${extraSplits[0].name} -> ${extraSplits[0].name} v2\n\t`,
        `Active split\nNone -> ${extraSplits[0].name} v2`
    ]);
    await saveSplitModalButton.click();
    await page.locator('[data-test-id=close-modal-button]').click();
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=active-split]')).toHaveText(
        `${extraSplits[0].name} v2`
    );

    await page.goto('/records/splits');
    expect((await splitButtons.allTextContents()).includes(`${extraSplits[0].name} v2`)).toBe(true);

    await page.goto(`/records/splits/${extraSplits[1].name}`);
    await splitNameInput.fill(`${extraSplits[1].name} v2`);
    expect(await splitStatusInput.isChecked()).toBe(false);
    await splitStatusInput.check();
    await saveButton.click();
    expect(await modifyingModalMessages.allTextContents()).toStrictEqual([
        `Name\n${extraSplits[1].name} -> ${extraSplits[1].name} v2\n\t`,
        `Active split\n${extraSplits[0].name} v2 -> ${extraSplits[1].name} v2`
    ]);
    await saveSplitModalButton.click();
    await page.locator('[data-test-id=close-modal-button]').click();
    await page.goto('/profile');
    await expect(page.locator('[data-test-id=active-split]')).toHaveText(
        `${extraSplits[1].name} v2`
    );

    await page.goto('/records/splits');
    expect((await splitButtons.allTextContents()).includes(`${extraSplits[1].name} v2`)).toBe(true);
});

test('should save split correctly', async ({ extraSplitsCreatedPage, split, extraSplits }) => {
    // make some basic changes then save
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${split.name}`);

    const splitNameInput = page.locator('[data-test-id=split-name-input]');
    const overloadFrequencySelector = page.locator('[data-test-id=overload-frequency-selector]');
    const progressionRangeInput = page.locator('[data-test-id=progression-range-input]');
    const splitStatusInput = page.locator('[data-test-id=split-status-input]');

    await expect(splitNameInput).toBeEditable();
    await splitNameInput.fill('Random split name');
    await overloadFrequencySelector.selectOption('/month');
    await progressionRangeInput.fill(
        (parseFloat(await progressionRangeInput.inputValue()) + 2.5).toString()
    );
    await splitStatusInput.check();

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
        const dayWorkoutInput = page.locator(`[data-test-id=${days[i]}-workout-input]`);
        await expect(dayWorkoutInput).toBeEditable();
        await dayWorkoutInput.fill(`Random${i}`);
    }
    let scheduleChangeString = 'Schedule\n';
    for (let i = 0; i < 7; i++) {
        scheduleChangeString += `${days[i]}: ${split.schedule[i]} -> Random${i}\n`;
    }

    await page.locator('[data-test-id=save-button]').click();
    expect(
        await page.locator('[data-test-id=modifyingModal-messages-list] li').allTextContents()
    ).toEqual([
        `Name\n${split.name} -> Random split name\n\t`,
        scheduleChangeString + '\t',
        `Overload frequency\n${split.overloadFrequency} -> /month\n\t`,
        `Overload value\n${split.progressiveOverload}% -> ${split.progressiveOverload + 2.5}%\n\t`,
        `Active split\n${extraSplits[1].name} -> Random split name`
    ]);
    // need to add workouts to each random workout....
    await page.locator('[data-test-id=save-split-modal-button]').click();
    await expect(page.locator('[data-test-id-modal-title]')).toHaveText('Success');
    expect(
        await page.locator('[data-test-id=modal-messages-list]').allTextContents()
    ).toStrictEqual(['Split saved successfully']);

    await Promise.all([
        page.locator('[data-test-id=close-modal-button]').click(),
        page.waitForNavigation()
    ]);
    expect(page.url().endsWith('/records/splits')).toBe(true);
    const splitButtons = page.locator('[data-test-id=splits-list] a h2');
    expect((await splitButtons.allTextContents()).includes('Random split name')).toBe(true);
    await page.goto(`/records/splits/Random%20Split%20Name`);
    await page.reload();

    const workoutNames = page.locator('[data-test-id=schedule-inputs-container] input');
    await expect(splitNameInput).toHaveValue('Random split name');
    for (let i = 0; i < 7; i++) {
        await expect(workoutNames.nth(i)).toHaveText(`Random${i}`);
    }
    await expect(progressionRangeInput).toHaveValue(
        (parseFloat(await progressionRangeInput.inputValue()) + 2.5).toString()
    );
    expect(await splitStatusInput.isChecked()).toStrictEqual(true);
});

test('should give error after adding new workout (add at least one exercise)', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${extraSplits[0].name}`);

    const workoutNames = page.locator('[data-test-id=schedule-inputs-container] input');
    await workoutNames.first().fill('Random new workout');
    const saveButton = page.locator('[data-test-id=save-button]');
    await saveButton.click();

    const saveSplitModalButton = page.locator('[data-test-id=save-split-modal-button]');
    await expect(saveSplitModalButton).toBeVisible();
    await saveSplitModalButton.click();

    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Error');
    expect(
        await page.locator('[data-test-id=modal-messages-list] li').allTextContents()
    ).toStrictEqual(['Add at least one exercise in Random new workout']);
});

test('should make changed workout indicator yellow', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    // also check day being showed if repeating changed workout
});

test('should make new workouts indicators green', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    // also check day being showed if repeating changed workout
});

test('should give error if split name changed to something which already exists', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    // change name to already existing split
    // should give error here
});

// TODO
/*
    modify workouts check
    success modal (split modified and SAVED successfully)
    change workouts
    go in modify workouts and cross check workout data
    should give error if splitName changed to something which already exists
*/
