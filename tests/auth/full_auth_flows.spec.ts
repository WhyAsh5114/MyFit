import { testWithCreatableUsername, expect } from '../fixtures.js';
import type { Cookie } from '@playwright/test';

testWithCreatableUsername(
	'testing normal auth flow register->login->logout through endpoints',
	async ({ page, creatable_username }) => {
		let cookies: Cookie[];
		let session_id: Cookie | undefined;

		const register_res = await page.request.post('/api/auth/register', {
			data: {
				username: creatable_username,
				password: 'password'
			}
		});
		expect(register_res.status()).toStrictEqual(201);
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeUndefined();

		const login_res = await page.request.post('/api/auth/login', {
			data: {
				username: creatable_username,
				password: 'password'
			}
		});
		expect(login_res.status()).toStrictEqual(200);
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeDefined();

		const logout_res = await page.request.get('/api/auth/logout');
		expect(logout_res.status()).toStrictEqual(201);
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeUndefined();
	}
);

testWithCreatableUsername(
	'testing normal auth flow register->login->logout through UI',
	async ({ page, creatable_username }) => {
		let cookies: Cookie[];
		let session_id: Cookie | undefined;

		// Register
		await page.goto('/profile/register');
		await page.fill('input[placeholder=Username]', creatable_username);
		await page.fill('input[placeholder=Password]', 'password');
		await page.fill('input[placeholder="Confirm Password"]', 'password');
		// Button and response
		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/register') && response.status() === 201
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);
		// Modal message
		const messages = page.locator('ul[data-test-id=modal-messages-list] li');
		expect(await messages.allTextContents()).toStrictEqual(['Account created successfully']);
		// Cookies
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeUndefined();

		// Login
		await Promise.all([messages.first().click(), page.waitForNavigation()])
		expect(page.url()).toContain('/profile/login');
		await page.fill('input[placeholder=Username]', creatable_username);
		await page.fill('input[placeholder=Password]', 'password');
		// Button and response
		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/login') && response.status() === 200
			),
			page.locator('button', { hasText: 'Submit' }).click()
		]);
		// Cookies
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeDefined();

		// Logout
		await expect(page).toHaveURL('/profile');
		// Button and response
		await Promise.all([
			page.waitForResponse(
				(response) => response.url().includes('/api/auth/logout') && response.status() === 201
			),
			page.locator('button[data-test-id=profile-logout-button]').click()
		]);
		await expect(page).toHaveURL('/profile/login');
		// Cookies
		cookies = await page.context().cookies();
		session_id = cookies.find((cookie) => cookie.name === 'session_id');
		expect(session_id).toBeUndefined();
	}
);
