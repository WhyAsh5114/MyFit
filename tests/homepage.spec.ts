import { expect, test } from '@playwright/test';

test('Navbar has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'MyFit' })).toBeVisible();
});

test("Can't access user pages when not logged in", async ({ page, baseURL }) => {
	const userPathnames = ['/profile', '/mesocycles', '/workouts'];
	for (let i = 0; i < userPathnames.length; i++) {
		await page.goto(userPathnames[i]);
		expect(page.url()).toBe(`${baseURL}/login?callbackURL=${userPathnames[i]}`);
	}
});

test('Should go to Google login after clicking button', async ({ page }) => {
	await page.goto('/login');
	await page.getByRole('button', { name: 'Google logo Sign in with Google' }).click();
	await page.waitForURL('https://accounts.google.com/**');
});
