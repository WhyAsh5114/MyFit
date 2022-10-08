import { test, expect, messages, colors } from '../../fixtures.js';

test.beforeEach(async ({ splitWorkoutsLoadedPage }) => {
    await splitWorkoutsLoadedPage.locator('button', { hasText: 'Set split options' }).click();
});

test('should load default values (color, message, freq, value)', async ({
    splitWorkoutsLoadedPage
}) => {
    const page = splitWorkoutsLoadedPage;
    await expect(page.locator('div[data-test-id="progressionValueDiv"]')).toHaveText('5%');
    await expect(page.locator('div[data-test-id="overloadMessageDiv"]')).toHaveText(
        'Nice sweet spot'
    );
    expect(
        await page.locator('select[data-test-id="overloadFrequencySelector"]').inputValue()
    ).toEqual('/week');
});

test('should display appropriate values', async ({ splitWorkoutsLoadedPage }) => {
    const page = splitWorkoutsLoadedPage;
    const slider = page.locator('input[data-test-id="progressionValueSlider"]');
    const progressionValue = page.locator('div[data-test-id="progressionValueDiv"]');
    const overloadMessage = page.locator('div[data-test-id="overloadMessageDiv"]');
    const graphIcon = page.locator('[data-test-id="graphIcon"]');
    const optionsBox = page.locator('[data-test-id="optionsBox"]');
    const frequencySelector = page.locator('[data-test-id="overloadFrequencySelector"]');

    const check = async (inputValue: string, colorMatchers: RegExp[], message: string) => {
        await slider.fill(inputValue);
        await expect(progressionValue).toHaveText(`${inputValue}%`);
        await expect(progressionValue).toHaveClass(colorMatchers[0]);
        await expect(overloadMessage).toHaveText(message);
        await expect(graphIcon).toHaveClass(colorMatchers[2]);
        await expect(graphIcon).toHaveClass(colorMatchers[3]);
        await expect(optionsBox).toHaveClass(colorMatchers[1]);
    };

    for (let i = 0; i <= 10; i++) {
        const inputValue = i * 2.5;
        let regexes: RegExp[] = [];
        colors.get(inputValue)?.map((color) => {
            regexes.push(new RegExp(color));
        });
        await check(inputValue.toString(), regexes, messages[inputValue]);
    }

    await frequencySelector.selectOption('/session');
    for (let i = 0; i <= 10; i++) {
        const inputValue = i * 2.5;
        let regexes: RegExp[] = [];

        let adjustedValue = 25;
        let adjustedColors = colors.get(25);
        for (let [value, maybeColors] of colors) {
            if (value >= inputValue * 1.5) {
                adjustedValue = value;
                adjustedColors = maybeColors;
                break;
            }
        }
        adjustedColors?.map((color) => {
            regexes.push(new RegExp(color));
        });
        await check(inputValue.toString(), regexes, messages[adjustedValue]);
    }

    await frequencySelector.selectOption('/month');
    for (let i = 0; i <= 10; i++) {
        const inputValue = i * 2.5;
        let regexes: RegExp[] = [];

        let adjustedValue = 25;
        let adjustedColors = colors.get(25);
        for (let [value, maybeColors] of colors) {
            if (value >= inputValue * 0.5) {
                adjustedValue = value;
                adjustedColors = maybeColors;
                break;
            }
        }
        adjustedColors?.map((color) => {
            regexes.push(new RegExp(color));
        });
        await check(inputValue.toString(), regexes, messages[adjustedValue]);
    }
});

test('should call saveSplit endpoint, show correct modal, and redirect to home after closing modal', async ({
    splitWorkoutsLoadedPage
}) => {
    const page = splitWorkoutsLoadedPage;
    const createSplitButton = page.locator('[data-test-id="createSplitButton"]');

    await Promise.all([
        createSplitButton.click(),
        page.waitForRequest('/api/splits/saveSplit'),
        page.waitForResponse((res) => res.ok())
    ]);

    const modalTitle = page.locator('[data-test-id="modal-title"]');
    const modalTexts = page.locator('[data-test-id="modal-messages-list"] li');
    const modalCloseButton = page.locator('[data-test-id="close-modal-button"]');

    await expect(modalTitle).toHaveText('Success');
    expect(await modalTexts.allTextContents()).toEqual(['Split created successfully']);

    await Promise.all([modalCloseButton.click(), page.waitForNavigation()]);
    expect(page.url()).toBe('http://localhost:4173/');
});
