import { test, expect } from '../../fixtures.js';
const Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

test('should redirect to /splits/new as SplitName & SplitSchedule stores are empty', async ({
    loggedInPage
}) => {
    await loggedInPage.goto('/splits/new/workouts');
    await expect(loggedInPage).toHaveURL('/splits/new');
});

test('should open help modal after clicking help button', async ({ splitStoreLoadedPage }) => {
    await splitStoreLoadedPage.locator('div[data-test-id=help-button]').click();
    const messages = splitStoreLoadedPage.locator('ul[data-test-id=modal-messages-list] li');
    expect(await messages.allTextContents()).toStrictEqual([
        'Select unique workouts from the calendar section',
        'All days on which the workout is to be performed will be highlighted',
        'Create the workout using the action buttons at the bottom',
        'Add at least one exercise to each unique workout'
    ]);
});

test('should load the split schedule into calendar', async ({ split, splitStoreLoadedPage }) => {
    for (let i = 0; i < Days.length; i++) {
        const workout = split.schedule[i];
        const workoutElement = splitStoreLoadedPage.locator(`p[data-test-id=workout-${Days[i]}]`);
        await expect(workoutElement).toHaveText(workout);
    }
});

test('should highlight first unique workout on load', async ({ split, splitStoreLoadedPage }) => {
    const firstUniqueWorkout = split.schedule.find((workout) => workout !== 'Rest') as string;
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitStoreLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === firstUniqueWorkout) {
            await expect(calendarElement).toHaveClass(/border-accent/);
            await expect(calendarElement).not.toHaveClass(/border-base-100/);
        } else {
            await expect(calendarElement).toHaveClass(/border-base-100/);
            await expect(calendarElement).not.toHaveClass(/border-accent/);
        }
    }
});

test('should darken Rest days and make them kinda disabled', async ({
    split,
    splitStoreLoadedPage
}) => {
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitStoreLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === 'Rest') {
            await expect(calendarElement).toHaveClass(/opacity-50/);
            await expect(calendarElement).not.toHaveClass(/cursor-pointer/);
        } else {
            await expect(calendarElement).toHaveClass(/cursor-pointer/);
            await expect(calendarElement).not.toHaveClass(/opacity-50/);
        }
    }
});

test('should select other unique workout and highlight its instances', async ({
    split,
    splitStoreLoadedPage
}) => {
    const firstUniqueWorkout = split.schedule.find((workout) => workout !== 'Rest');
    if (firstUniqueWorkout === undefined) {
        throw new Error('No unique workout found, all rest days?');
    }
    const secondUniqueWorkout = split.schedule.find(
        (workout) => workout !== 'Rest' && workout !== firstUniqueWorkout
    );
    if (secondUniqueWorkout === undefined) {
        throw new Error('No 2nd unique workout found, only one unique workout?');
    }
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitStoreLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === secondUniqueWorkout) {
            await calendarElement.click();
            break;
        }
    }
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitStoreLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === secondUniqueWorkout) {
            await expect(calendarElement).toHaveClass(/border-accent/);
            await expect(calendarElement).not.toHaveClass(/border-base-100/);
        } else {
            await expect(calendarElement).toHaveClass(/border-base-100/);
            await expect(calendarElement).not.toHaveClass(/border-accent/);
        }
    }
});

test('should change exercise list when changing workout', async ({
    split,
    splitWorkoutsLoadedPage
}) => {
    const uniqueWorkouts = new Set<string>();
    for (const workout of split.schedule) {
        if (workout !== 'Rest') {
            uniqueWorkouts.add(workout);
        }
    }

    const page = splitWorkoutsLoadedPage;
    for (const workout of uniqueWorkouts) {
        for (const day of Days) {
            const workoutElement = page.locator(`p[data-test-id=workout-${day}]`);
            const currentWorkout = (await workoutElement.textContent()) as string;
            if (currentWorkout === workout) {
                await workoutElement.click();
                await expect(page.locator('[data-test-id=workout-name]')).toHaveText(workout);
            }
        }

        for (const exercise of split.splitWorkouts[workout]) {
            const exerciseData = await page
                .locator(`div[data-test-id=entry-${exercise.id}] p`)
                .allTextContents();
            expect(Number(exerciseData[0])).toStrictEqual(exercise.id);
            expect(exerciseData[1]).toStrictEqual(exercise.name);
            expect(Number(exerciseData[2])).toStrictEqual(exercise.reps);
            expect(Number(exerciseData[3])).toStrictEqual(exercise.sets);
            expect(Number(exerciseData[4])).toStrictEqual(exercise.load);
        }
    }
});

test('should not select Rest day from calendar', async ({ splitWorkoutsLoadedPage, split }) => {
    const firstRestDay = split.schedule.find((workout) => workout === 'Rest');
    if (firstRestDay === undefined) {
        throw new Error('No Rest day found in split schedule');
    }
    // Try to select the calendar element
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitWorkoutsLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === 'Rest') {
            await calendarElement.click();
        }
    }
    // Make sure it doesn't do anything anyway
    for (let i = 0; i < Days.length; i++) {
        const calendarElement = splitWorkoutsLoadedPage.locator(
            `div[data-test-id=calendar-${Days[i]}]`
        );
        if (split.schedule[i] === 'Rest') {
            await expect(calendarElement).toHaveClass(/border-base-100/);
            await expect(calendarElement).not.toHaveClass(/border-accent/);
        }
    }
});
