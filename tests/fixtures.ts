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
	creatable_username: string;
	registered_account: AccountDetails;
	user: User;
	loggedInPage: Page;
}

export const test = base.extend<MyFixtures>({
	creatable_username: [
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
	registered_account: [
		async ({ creatable_username, request }, use) => {
			const random_password = generate_random_phrase(10);
			const credentials: AccountDetails = {
				username: creatable_username,
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
		async ({ request, registered_account }, use) => {
			// Get the account details as UserData
			const data = await request.post('/api/auth/getUserData', {
				data: registered_account
			});
			const rawBody = await data.json();
			const userData: User = data ? JSON.parse(rawBody.user) : '';
			userData.password = registered_account.password;
			await use(userData);
		},
		{ scope: 'test' }
	],
	loggedInPage: async ({ page, user }, use) => {
		// Login with account
		const login_res = await page.request.post('/api/auth/login', {
			data: {
				username: user.username,
				password: user.password
			}
		});
		expect(login_res.ok()).toStrictEqual(true);
		await use(page);
	}
});

export { expect } from '@playwright/test';
