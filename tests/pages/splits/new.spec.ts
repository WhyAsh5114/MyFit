import { testLoggedIn, expect } from '../../fixtures.js';

testLoggedIn.beforeEach(async ({ page }) => {
	await page.goto('/splits/new');
});

testLoggedIn('should show info modal when clicked on help', async ({ page }) => {
	await page.locator('div[data-test-id=help-button]').click();
	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual([
		'Use different names if workouts are going to be different',
		'For example: if Push workout on Monday is different from Push workout on Thursday, use Push1 and Push2',
		'Use same names only for identical workouts'
	]);
});

testLoggedIn(
	'should throw error (Enter split name, Add at least one workout)',
	async ({ page }) => {
		await page.locator('button', { hasText: 'Create 0 unique workouts' }).click();
		const messages = page.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual([
			'Enter split name',
			'Add at least one workout'
		]);
	}
);

testLoggedIn('should throw error (Add at least one workout)', async ({ page }) => {
	await page.fill('input[data-test-id=Mon]', 'workout1');
	await page.locator('button', { hasText: 'Create 1 unique workout' }).click();
	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Enter split name']);
});

testLoggedIn('should throw error (Enter split name)', async ({ page }) => {
	await page.fill('input[data-test-id=split-name-input]', 'split name');
	await page.locator('button', { hasText: 'Create 0 unique workouts' }).click();
	const messages = page.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Add at least one workout']);
});

testLoggedIn('should update unique workouts number properly', async ({ page }) => {
	// '', '', '', '', '', '', ''
	const submit_button = page.locator('button[data-test-id=create-schedule-button]');

	await page.fill('input[data-test-id=Mon]', 'workout1');
	// 'workout1', '', '', '', '', '', ''
	await expect(submit_button).toHaveText('Create 1 unique workout');

	await page.fill('input[data-test-id=Tue]', 'workout2');
	// 'workout1', 'workout2', '', '', '', '', ''
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Wed]', 'workout1');
	// 'workout1', 'workout2', 'workout1', '', '', '', ''
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Thu]', 'rest');
	// 'workout1', 'workout2', 'workout1', 'rest', '', '', ''
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Fri]', 'workout3');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout3', '', ''
	await expect(submit_button).toHaveText('Create 3 unique workouts');

	await page.fill('input[data-test-id=Fri]', 'workout2');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', '', ''
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Sat]', 'rest');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', 'rest', ''
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Sun]', 'REST');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Tue]', '');
	// 'workout1', '', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Mon]', '');
	// '', '', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submit_button).toHaveText('Create 2 unique workouts');

	await page.fill('input[data-test-id=Wed]', '');
	// '', '', '', 'rest', 'workout2', 'rest', 'REST'
	await expect(submit_button).toHaveText('Create 1 unique workout');

	await page.fill('input[data-test-id=Fri]', '');
	// '', '', '', 'rest', '', 'rest', 'REST'
	await expect(submit_button).toHaveText('Create 0 unique workouts');
});
