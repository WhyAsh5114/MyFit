import { expect, test } from '@playwright/test';
import { signUp } from './support/auth';

test('a new account signs up, lands on the dashboard and stays signed in after a reload', async ({
	page
}) => {
	await signUp(page);
	await page.reload();
	await expect(page).toHaveURL(/\/dashboard/);
});
