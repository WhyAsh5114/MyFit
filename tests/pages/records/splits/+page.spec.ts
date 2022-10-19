import { test, expect, getFormattedDate } from '../../../fixtures.js';

test('should show "No split created" on new account', async ({ loggedInPage }) => {
    await loggedInPage.goto('/records/splits');
    const noSplitLabel = loggedInPage.locator('[data-test-id="no-split-label"]');
    const createSplitButton = loggedInPage.locator('[data-test-id="create-split-button"]');

    await expect(noSplitLabel).toHaveText('No split created');
    await Promise.all([createSplitButton.click(), loggedInPage.waitForNavigation()]);
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

test('should underline split which is currently being modified', async ({
    extraSplitsCreatedPage,
    extraSplits,
    split
}) => {
    const page = extraSplitsCreatedPage;
    await page.goto(`/records/splits/${extraSplits[1].name}`);

    const splitName = page.locator('[data-test-id=split-name-input]');
    await splitName.fill('changed value');
    await page.locator('[data-test-id=records-splits-redirect]').click();

    const modifiedSplit = page.locator('ul[data-test-id=splits-list] a h2', {
        hasText: extraSplits[1].name
    });
    await expect(modifiedSplit).toHaveClass(/text-yellow-400 underline underline-offset-4/);

    await page.goto(`/records/splits/${split.name}`);
    await splitName.fill('changed value');
    await page.locator('[data-test-id=records-splits-redirect]').click();

    const modifiedSplit2 = page.locator('ul[data-test-id=splits-list] a h2', {
        hasText: split.name
    });
    await expect(modifiedSplit).not.toHaveClass(/text-yellow-400 underline underline-offset-4/);
    await expect(modifiedSplit2).toHaveClass(/text-yellow-400 underline underline-offset-4/);
});

test('should open help modal', async ({ splitCreatedPage }) => {
    const page = splitCreatedPage;
    await page.goto('/records/splits');
    await page.locator('[data-test-id=help-button]').click();

    await expect(page.locator('[data-test-id=modal-title]')).toHaveText('Help');
    expect(
        await page.locator('[data-test-id=modal-messages-list] li').allTextContents()
    ).toStrictEqual([
        'A split with a blue border is the active split',
        'A split with yellow and underlined text has unsaved changes',
        'Unsaved changes to a split will be lost when refreshing the page or going to a different split'
    ]);
});
