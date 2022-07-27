import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createClient } from 'redis';

export function generate_random_phrase(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

type MyFixtures = {
	creatableUsername: string;
	registeredAccount: AccountDetails;
	user: User;
	loggedInPage: Page;
	split: Split;
	splitStoreLoadedPage: Page;
};

export const test = base.extend<MyFixtures>({
	creatableUsername: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			const client = createClient();
			await client.connect();

			// Generate an unused username
			let username: string;
			do {
				username = 'user' + generate_random_phrase(5);
			} while ((await client.get(username)) !== null);
			await use(username);
		},
		{ scope: 'test' }
	],
	registeredAccount: [
		async ({ creatableUsername, request }, use) => {
			const random_password = generate_random_phrase(10);
			const credentials: AccountDetails = {
				username: creatableUsername,
				password: random_password
			};
			const register_res = await request.post('/api/auth/register', {
				data: credentials
			});
			expect(register_res.ok()).toStrictEqual(true);
			await use(credentials);
		},
		{ scope: 'test' }
	],
	user: [
		async ({ request, registeredAccount }, use) => {
			// Get the account details as UserData
			const data = await request.post('/api/auth/getUserData', {
				data: registeredAccount
			});
			const rawBody = await data.json();
			const userData: User = data ? JSON.parse(rawBody.user) : '';
			userData.password = registeredAccount.password;
			await use(userData);
		},
		{ scope: 'test' }
	],
	loggedInPage: [
		async ({ page, user }, use) => {
			// Login with account
			const login_res = await page.request.post('/api/auth/login', {
				data: {
					username: user.username,
					password: user.password
				}
			});
			expect(login_res.ok()).toStrictEqual(true);
			await use(page);
		},
		{ scope: 'test' }
	],
	split: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			// Create sample split
			const split: Split = {
				name: 'PPL',
				schedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
				split_workouts: {}
			};

			await use(split);
		},
		{ scope: 'test' }
	],
	splitStoreLoadedPage: [
		async ({ loggedInPage, split }, use) => {
			await loggedInPage.goto('/splits/new');
			await loggedInPage.goto('/splits/new');
			await loggedInPage.fill('input[data-test-id=split-name-input]', split.name);
			await loggedInPage.fill('input[data-test-id=Mon]', split.schedule[0]);
			await loggedInPage.fill('input[data-test-id=Tue]', split.schedule[1]);
			await loggedInPage.fill('input[data-test-id=Wed]', split.schedule[2]);
			await loggedInPage.fill('input[data-test-id=Thu]', split.schedule[3]);
			await loggedInPage.fill('input[data-test-id=Fri]', split.schedule[4]);
			await loggedInPage.fill('input[data-test-id=Sat]', split.schedule[5]);
			await loggedInPage.fill('input[data-test-id=Sun]', split.schedule[6]);
			await loggedInPage
				.locator('button[data-test-id=create-schedule-button]', {
					hasText: 'Create 3 unique workouts'
				})
				.click();
			await expect(loggedInPage).toHaveURL('/splits/new/workouts');
			await use(loggedInPage);
		},
		{ scope: 'test' }
	]
});

export { expect } from '@playwright/test';
