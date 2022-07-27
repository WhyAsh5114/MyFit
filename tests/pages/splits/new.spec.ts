import { test, expect } from '../../fixtures.js';

test.beforeEach(async ({ loggedInPage }) => {
	await loggedInPage.goto('/splits/new');
});

test('should show help modal when clicked on help', async ({ loggedInPage }) => {
	await loggedInPage.locator('div[data-test-id=help-button]').click();
	const messages = loggedInPage.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual([
		'Use different names if workouts are going to be different',
		'For example: if Push workout on Monday is different from Push workout on Thursday, use Push1 and Push2',
		'Use same names only for identical workouts'
	]);
});

test(
	'should throw error (Enter split name, Add at least one workout)',
	async ({ loggedInPage }) => {
		await loggedInPage.locator('button', { hasText: 'Create 0 unique workouts' }).click();
		const messages = loggedInPage.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual([
			'Enter split name',
			'Add at least one workout'
		]);
	}
);

test('should throw error (Add at least one workout)', async ({ loggedInPage }) => {
	await loggedInPage.fill('input[data-test-id=Mon]', 'workout1');
	await loggedInPage.locator('button', { hasText: 'Create 1 unique workout' }).click();
	const messages = loggedInPage.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Enter split name']);
});

test('should throw error (Enter split name)', async ({ loggedInPage }) => {
	await loggedInPage.fill('input[data-test-id=split-name-input]', 'split name');
	await loggedInPage.locator('button', { hasText: 'Create 0 unique workouts' }).click();
	const messages = loggedInPage.locator('ul[data-test-id=modal-messages-list] li');
	expect(await messages.allTextContents()).toStrictEqual(['Add at least one workout']);
});

test('should update unique workouts number properly', async ({ loggedInPage }) => {
	// '', '', '', '', '', '', ''
	const submitButton = loggedInPage.locator('button[data-test-id=create-schedule-button]');

	await loggedInPage.fill('input[data-test-id=Mon]', 'workout1');
	// 'workout1', '', '', '', '', '', ''
	await expect(submitButton).toHaveText('Create 1 unique workout');

	await loggedInPage.fill('input[data-test-id=Tue]', 'workout2');
	// 'workout1', 'workout2', '', '', '', '', ''
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Wed]', 'workout1');
	// 'workout1', 'workout2', 'workout1', '', '', '', ''
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Thu]', 'rest');
	// 'workout1', 'workout2', 'workout1', 'rest', '', '', ''
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Fri]', 'workout3');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout3', '', ''
	await expect(submitButton).toHaveText('Create 3 unique workouts');

	await loggedInPage.fill('input[data-test-id=Fri]', 'workout2');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', '', ''
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Sat]', 'rest');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', 'rest', ''
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Sun]', 'REST');
	// 'workout1', 'workout2', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Tue]', '');
	// 'workout1', '', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Mon]', '');
	// '', '', 'workout1', 'rest', 'workout2', 'rest', 'REST'
	await expect(submitButton).toHaveText('Create 2 unique workouts');

	await loggedInPage.fill('input[data-test-id=Wed]', '');
	// '', '', '', 'rest', 'workout2', 'rest', 'REST'
	await expect(submitButton).toHaveText('Create 1 unique workout');

	await loggedInPage.fill('input[data-test-id=Fri]', '');
	// '', '', '', 'rest', '', 'rest', 'REST'
	await expect(submitButton).toHaveText('Create 0 unique workouts');
});
