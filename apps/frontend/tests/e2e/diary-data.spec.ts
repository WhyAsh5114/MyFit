import { expect, test, type Page } from '@playwright/test';
import { API, clickLogout, newEmail, setUpName, signIn, signUp } from './support/auth';

const WEB = 'http://localhost:4173';
const CORS = {
	'access-control-allow-origin': WEB,
	'access-control-allow-credentials': 'true',
	'access-control-allow-headers': 'content-type',
	'access-control-allow-methods': 'POST, OPTIONS'
};
const yogurt = {
	name: 'Greek yogurt',
	quantityG: 150,
	energyKcal_100g: 65,
	carbohydratesG_100g: 4,
	fatG_100g: 0.4,
	proteinsG_100g: 10
};

/** The diary day `offset` days from today, as the route spells it. */
const day = (offset = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offset);
	return date.toLocaleDateString('en-CA');
};

/** Logs the yogurt through the chat, whose reply is a canned food card instead of the model. */
async function logYogurt(page: Page) {
	const chunks = [
		{ type: 'start' },
		{ type: 'start-step' },
		{ type: 'tool-input-available', toolCallId: 'f', toolName: 'createFoodEntry', input: yogurt },
		{ type: 'finish-step' },
		{ type: 'finish' }
	];
	await page.route(`${API}/api/chat`, (route) => {
		if (route.request().method() === 'OPTIONS')
			return route.fulfill({ status: 204, headers: CORS });
		return route.fulfill({
			status: 200,
			headers: {
				...CORS,
				'content-type': 'text/event-stream',
				'x-vercel-ai-ui-message-stream': 'v1'
			},
			body: [
				...chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`),
				'data: [DONE]\n\n'
			].join('')
		});
	});
	await page.goto('/chat');
	await page.getByPlaceholder('Tell me what you ate...').fill('I ate yogurt');
	await page.getByRole('button', { name: 'Send' }).click();
	await page.getByRole('button', { name: 'Log', exact: true }).click();
	await page.getByText('Logged').waitFor();
}

test('a pull from another device updates the open diary without a reload', async ({ browser }) => {
	const email = newEmail();
	const first = await browser.newContext();
	const firstPage = await first.newPage();
	await signUp(firstPage, email);
	await firstPage.goto(`/food-diary/${day()}`);
	await expect(firstPage.getByText('Today', { exact: true })).toBeVisible();
	await expect(firstPage.getByText('Greek yogurt')).toHaveCount(0);

	const second = await browser.newContext();
	const secondPage = await second.newPage();
	await signIn(secondPage, email);
	await expect(secondPage).toHaveURL(/dashboard/);
	await logYogurt(secondPage);

	// The sync worker pushes and pulls every ten seconds; a pull reruns the page's `load`.
	await expect(firstPage.getByText('Greek yogurt')).toBeVisible({ timeout: 60_000 });
	await first.close();
	await second.close();
});

test('cold starts, day changes, deletes and account switches show the right data', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));

	const email = await signUp(page);
	await logYogurt(page);

	await page.goto(`/food-diary/${day()}`);
	await expect(page.getByText('Greek yogurt')).toBeVisible();
	await page.reload();
	await expect(page.getByText('Greek yogurt')).toBeVisible();

	await page.locator('.lucide-chevron-right').click();
	await expect(page).toHaveURL(new RegExp(`${day(1)}$`));
	await expect(page.getByText('Tomorrow', { exact: true })).toBeVisible();
	await expect(page.getByText('Greek yogurt')).toHaveCount(0);
	await page.locator('.lucide-chevron-left').click();
	await expect(page).toHaveURL(new RegExp(`${day()}$`));
	await expect(page.getByText('Greek yogurt')).toBeVisible();

	await page.getByText('Greek yogurt').click();
	await page.getByRole('button', { name: 'Delete entry' }).click();
	await expect(page).toHaveURL(new RegExp(`${day()}$`));
	await expect(page.getByText('Greek yogurt')).toHaveCount(0);

	// Another account on the same browser must not see the first one's entries.
	await logYogurt(page);
	await clickLogout(page, email);
	await expect(page).toHaveURL(/\/login/);
	await signIn(page, newEmail());
	await setUpName(page);
	await page.goto(`/food-diary/${day()}`);
	await expect(page.getByText('Today', { exact: true })).toBeVisible();
	await expect(page.getByText('Greek yogurt')).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('the bare diary and edit routes go straight to the day', async ({ page }) => {
	await signUp(page);
	await page.goto('/food-diary');
	await expect(page).toHaveURL(new RegExp(`/food-diary/${day()}$`));
	await page.goto(`/food-diary/${day(1)}/edit-food`);
	await expect(page).toHaveURL(new RegExp(`/food-diary/${day(1)}$`));
	await expect(page.getByText('Tomorrow', { exact: true })).toBeVisible();
});
