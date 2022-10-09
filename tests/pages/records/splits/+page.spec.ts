import { test, expect, getFormattedDate } from '../../../fixtures.js';

test('should show "No split created" on new account', async ({ loggedInPage }) => {
    await loggedInPage.goto('/records/splits');
    const noSplitLabel = loggedInPage.locator('[data-test-id="no-split-label"]');
    const createSplitButton = loggedInPage.locator('[data-test-id="create-split-button"]');

    await expect(noSplitLabel).toHaveText('No split created');
    await Promise.all([await createSplitButton.click(), await loggedInPage.waitForNavigation()]);
    expect(loggedInPage.url()).toContain('/splits/new');
});

test('should show created split and highlight it', async ({ splitCreatedPage, split }) => {
    const page = splitCreatedPage;
    await page.goto('/records/splits');

    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect(await splitButtons.count()).toEqual(1);
    expect(await splitButtons.first().textContent()).toEqual(split.name);

    const splitDates = page.locator('ul[data-test-id=splits-list] a h3');
    expect(await splitDates.count()).toEqual(1);
    expect(await splitDates.first().textContent()).toEqual(getFormattedDate(split.timeCreated));

    const splitBox = page.locator('ul[data-test-id=splits-list] a');
    await expect(splitBox.first()).toHaveClass(/border-accent/);
});

test('should show all created splits', async ({ extraSplitsCreatedPage, extraSplits, split }) => {
    const page = extraSplitsCreatedPage;
    await page.goto('/records/splits');

    const splitBoxes = page.locator('ul[data-test-id=splits-list] a');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect(await splitBoxes.count()).toEqual(extraSplits.length + 1);

    const allSplitNames = [split.name];
    extraSplits.forEach((extraSplit) => {
        allSplitNames.push(extraSplit.name);
    });

    (await splitButtons.allTextContents()).forEach((splitName) => {
        expect(allSplitNames.includes(splitName)).toEqual(true);
    });
});

test('should highlight only latest created split', async ({
    extraSplitsCreatedPage,
    extraSplits
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto('/records/splits');

    const splitBoxes = page.locator('ul[data-test-id=splits-list] a');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    expect(await splitButtons.count()).toEqual(extraSplits.length + 1);

    const shouldBeActive = extraSplits.at(-1)?.name;
    for (let i = 0; i < (await splitButtons.count()); i++) {
        if ((await splitButtons.nth(i).textContent()) === shouldBeActive) {
            await expect(splitBoxes.nth(i)).toHaveClass(/border-accent/);
        } else {
            await expect(splitBoxes.nth(i)).toHaveClass(/border-base-100/);
        }
    }
});

test('should show correct dates', async ({ extraSplitsCreatedPage, extraSplits, split }) => {
    const page = extraSplitsCreatedPage;
    await page.goto('/records/splits');

    const splitBoxes = page.locator('ul[data-test-id=splits-list] a');
    const splitButtons = page.locator('ul[data-test-id=splits-list] a h2');
    const splitDates = page.locator('ul[data-test-id=splits-list] a h3');

    const allSplits = [...extraSplits, split];
    for (let i = 0; i < (await splitBoxes.count()); i++) {
        const splitName = await splitButtons.nth(i).textContent();
        const split = allSplits.find((split) => split.name === splitName) as Split;
        const splitDateCreated = await splitDates.nth(i).textContent();
        expect(getFormattedDate(split.timeCreated)).toStrictEqual(splitDateCreated);
    }
});
