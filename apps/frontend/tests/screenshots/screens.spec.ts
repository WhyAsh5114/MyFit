import { expect, test, type Page, type Route } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { API, EXT, FORMAT, MAIL, OUT_DIR, WEB } from './support/env';
import { findSmallTargets } from './support/tap-targets';

/** One captured screen. The gallery groups by `group` and lists `note` under the title. */
type Screen = { id: string; group: string; title: string; note: string };

const CORS = {
	'access-control-allow-origin': WEB,
	'access-control-allow-credentials': 'true',
	'access-control-allow-headers': 'content-type',
	'access-control-allow-methods': 'POST, OPTIONS'
};

/** A chat reply as the AI SDK's UI message stream. The real model is never called. */
const reply = (...chunks: object[]) => ({
	status: 200,
	headers: { ...CORS, 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' },
	body: [...chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`), 'data: [DONE]\n\n'].join('')
});

const text = (id: string, delta: string) => [
	{ type: 'text-start', id },
	{ type: 'text-delta', id, delta },
	{ type: 'text-end', id }
];
const foodCard = (toolCallId: string, input: object) => ({
	type: 'tool-input-available',
	toolCallId,
	toolName: 'createFoodEntry',
	input
});
const turn = (...chunks: object[]) =>
	reply(
		{ type: 'start' },
		{ type: 'start-step' },
		...chunks,
		{ type: 'finish-step' },
		{ type: 'finish' }
	);

const SAMPLE_FOODS = [
	{
		name: 'Greek yogurt',
		quantityG: 150,
		energyKcal_100g: 65,
		carbohydratesG_100g: 4,
		fatG_100g: 0.4,
		proteinsG_100g: 10
	},
	{
		name: 'Rolled oats',
		quantityG: 60,
		energyKcal_100g: 370,
		carbohydratesG_100g: 62,
		fatG_100g: 7,
		proteinsG_100g: 13
	}
];
const SANDWICH = {
	name: 'Grilled chicken sandwich',
	quantityG: 220,
	energyKcal_100g: 210,
	carbohydratesG_100g: 22,
	fatG_100g: 7,
	proteinsG_100g: 15
};
const PIZZA = {
	name: 'Pepperoni pizza',
	quantityG: 700,
	energyKcal_100g: 266,
	carbohydratesG_100g: 33,
	fatG_100g: 10,
	proteinsG_100g: 11
};

/** Answers `/api/chat` by looking at the last message, so a conversation plays out like a real one. */
async function mockChat(page: Page) {
	await page.route(`${API}/api/chat`, async (route: Route) => {
		const request = route.request();
		if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });

		const last = (request.postDataJSON() as { messages: { role: string }[] }).messages.at(-1)!;
		const json = JSON.stringify(last);
		if (/"output":"created"/.test(json)) {
			return route.fulfill(
				turn(
					...text(
						't1',
						'Done, I logged it:\n\n- 220 g sandwich\n- about **462 kcal**\n\nAnything else?'
					)
				)
			);
		}
		if (/requireClarification/.test(json) && /Grilled/.test(json)) {
			return route.fulfill(
				turn(...text('t0', 'Thanks! Here is **what I estimate**:'), foodCard('c2', SANDWICH))
			);
		}
		if (last.role === 'user' && /chicken sandwich/.test(json)) {
			return route.fulfill(
				turn({
					type: 'tool-input-available',
					toolCallId: 'c1',
					toolName: 'requireClarification',
					input: { message: 'How was the chicken cooked?', choices: ['Grilled', 'Fried', 'Raw'] }
				})
			);
		}
		if (/Quick question/.test(json)) {
			return route.fulfill(
				turn(
					{ type: 'reasoning-start', id: 'r' },
					{
						type: 'reasoning-delta',
						id: 'r',
						delta:
							'They ask about protein per meal. Their target is 160 g, so I will divide it and keep it short.'
					},
					{ type: 'reasoning-end', id: 'r' },
					...text(
						't',
						'Your protein target is **160 g** a day, so about **40 g** per meal across four meals.'
					)
				)
			);
		}
		if (/pizza/i.test(json)) return route.fulfill(turn(foodCard('pz', PIZZA)));
		const food = SAMPLE_FOODS.find((f) => json.includes(f.name)) ?? SAMPLE_FOODS[0];
		return route.fulfill(turn(foodCard('f', food)));
	});
}

/** Submits the email on the login form and waits for the code screen. */
async function requestCode(page: Page, email: string) {
	await page.getByLabel('Email').fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('heading', { name: 'Enter verification code' }).waitFor();
}

/** Types the code the mail stub recorded for this address and verifies it. */
async function enterCode(page: Page, email: string) {
	let code: string | undefined;
	await expect
		.poll(async () => {
			const res = await fetch(`${MAIL}/otp?email=${encodeURIComponent(email)}`);
			code = res.ok ? ((await res.json()) as { code: string }).code : undefined;
			return code;
		})
		.toBeTruthy();
	await page.getByRole('textbox').fill(code!);
	await page.getByRole('button', { name: 'Verify' }).click();
}

test('capture every screen', async ({ page }, testInfo) => {
	const theme = testInfo.project.name;
	const dir = join(OUT_DIR, theme);
	mkdirSync(dir, { recursive: true });

	const screens: Screen[] = [];
	const smallTargets: Record<string, string[]> = {};
	const shot = async (id: string, group: string, title: string, note = '') => {
		const small = await findSmallTargets(page);
		if (small.length) smallTargets[id] = small;
		await page.screenshot({
			path: join(dir, `${id}.${EXT}`),
			type: FORMAT,
			...(FORMAT === 'jpeg' && { quality: 72 })
		});
		screens.push({ id, group, title, note });
	};
	const go = async (path: string, settle = 1300) => {
		await page.goto(path);
		await page.waitForTimeout(settle);
	};
	const today = new Date().toISOString().slice(0, 10);
	const diary = `/food-diary/${today}`;
	const send = async (message: string) => {
		await page.getByPlaceholder('Tell me what you ate...').fill(message);
		await page.getByRole('button', { name: 'Send' }).click();
	};
	const logFromChat = async (message: string) => {
		await go('/chat', 600);
		await send(message);
		await page.getByRole('button', { name: 'Log', exact: true }).click();
		await page.waitForTimeout(700);
	};

	// ---- signed out
	await go('/', 1500);
	await shot('landing', 'Account', 'Landing page', '/');
	await go('/login');
	await shot('login', 'Account', 'Log in', '/login');
	const email = `shots-${crypto.randomUUID()}@example.test`;
	await requestCode(page, email);
	await page.waitForTimeout(500);
	await shot('login-otp', 'Account', 'Verification code', 'After entering an email');
	await enterCode(page, email);
	await page.getByLabel('Name').waitFor();
	await page.waitForTimeout(500);
	await shot('onboarding', 'Account', 'Set up your account', '/onboarding/setup-account');
	await page.getByLabel('Name').fill('Alex Morgan');
	await page.getByRole('button', { name: 'Submit' }).click();
	await page.waitForURL(/dashboard/);
	await page.waitForTimeout(1200);
	await shot('dashboard', 'Home', 'Dashboard', '/dashboard');

	// ---- diary and goals, before and after setup
	await go(diary);
	await shot(
		'diary-empty',
		'Food diary',
		'Diary, no goal yet',
		'First visit, before any goals are set'
	);
	await go('/food-diary/goals');
	await shot('goals', 'Goals', 'Goals', '/food-diary/goals');
	await go('/food-diary/goals/metrics');
	await shot('metrics-empty', 'Goals', 'Metrics', 'Empty form');
	await page.getByLabel('Bodyweight').fill('80');
	await page.getByLabel('Height').fill('180');
	await page.getByLabel('Age').fill('30');
	await page.getByLabel('Body fat').fill('18');
	await page.getByText('Male', { exact: true }).click();
	await page.waitForTimeout(400);
	await shot('metrics-filled', 'Goals', 'Metrics, filled', 'BMR is calculated as you type');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL(/goals$/);
	await page.waitForTimeout(250);
	await shot(
		'goals-saved',
		'Goals',
		'Goals after saving',
		'The card you changed shows Saved and highlights'
	);
	await go('/food-diary/goals/targets');
	await shot('targets', 'Goals', 'Targets', '/food-diary/goals/targets');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL(/goals$/);
	await go('/food-diary/goals/activity');
	await shot('activity', 'Goals', 'Activity calories', '/food-diary/goals/activity');
	await go('/food-diary/goals/meals');
	await shot('meals', 'Goals', 'Meals', 'Drag the handle to reorder');
	await go('/food-diary/goals/recipes');
	await shot('recipes', 'Goals', 'Recipes', 'Not built yet');
	await go('/food-diary/goals/recipes/new');
	await shot('recipes-new', 'Goals', 'New recipe', 'Not built yet');
	await go(diary);
	await shot('diary-goal', 'Food diary', 'Diary, goal set, nothing logged');

	// ---- add food
	await go(`${diary}/add-food`);
	await shot('add-food', 'Add food', 'Add food', '/food-diary/:date/add-food');
	await page.getByPlaceholder('apple pie').fill('yogurt');
	await page.waitForTimeout(2200);
	await shot('add-food-results', 'Add food', 'Search results', 'Typing "yogurt"');
	await page.getByText('Greek Yogurt, Plain').first().click();
	await page.waitForTimeout(1500);
	await shot('add-food-detail', 'Add food', 'Food detail', 'Before logging');
	await page.getByRole('button', { name: 'Edit nutrition' }).first().click();
	await page.waitForTimeout(900);
	await shot('nutrition-editor', 'Add food', 'Edit nutrition', 'A sheet over the food detail');
	await page.keyboard.press('Escape');
	await go(`${diary}/add-food/manual`);
	await shot('add-manual', 'Add food', 'Add manually', '/food-diary/:date/add-food/manual');
	await go(`${diary}/add-food/scan`, 1800);
	await shot('add-scan', 'Add food', 'Scan a barcode', 'The test browser has no camera');
	await go(`${diary}/add-activity`);
	await shot('add-activity', 'Add food', 'Add activity', 'Not built yet');

	// ---- chat
	await mockChat(page);
	for (const food of SAMPLE_FOODS) await logFromChat(`I ate ${food.name}`);
	await go('/chat');
	await shot('chat-empty', 'Chat', 'Chat, empty', '/chat');
	await send('Quick question: how much protein per meal?');
	await page.getByText('Your protein target').waitFor();
	await page.waitForTimeout(600);
	await shot('chat-reasoning', 'Chat', 'Reply with reasoning', 'Reasoning stays folded');
	await page.getByRole('button', { name: /Thought/ }).click();
	await page.waitForTimeout(500);
	await shot('chat-reasoning-open', 'Chat', 'Reasoning expanded');
	await page.getByRole('button', { name: 'Start a new chat' }).click();
	await send('I had a chicken sandwich');
	await page.getByText('How was the chicken cooked?').waitFor();
	await page.waitForTimeout(500);
	await shot('chat-question', 'Chat', 'A clarifying question', 'Tapping a choice does not send it');
	await page.getByRole('radio', { name: 'Grilled' }).click();
	await page.getByRole('button', { name: 'Send' }).first().click();
	await page.getByRole('button', { name: 'Log', exact: true }).waitFor();
	await page.waitForTimeout(700);
	await shot('chat-card', 'Chat', 'Confirm a food entry', 'Log or cancel');
	await page.getByRole('button', { name: 'Log', exact: true }).click();
	await page.getByText('Anything else?').waitFor();
	await page.waitForTimeout(600);
	await shot('chat-done', 'Chat', 'Entry logged', 'The card shows Logged');
	await page.unroute(`${API}/api/chat`);
	await page.route(`${API}/api/chat`, (route) =>
		route.request().method() === 'OPTIONS'
			? route.fulfill({ status: 204, headers: CORS })
			: route.fulfill({ status: 500, headers: CORS, body: 'nope' })
	);
	await page.getByRole('button', { name: 'Start a new chat' }).click();
	await send('Hello');
	await page.getByText("couldn't answer").waitFor();
	await page.waitForTimeout(500);
	await shot('chat-error', 'Chat', 'When the reply fails', 'Try again re-sends');
	await page.unroute(`${API}/api/chat`);

	// ---- diary with entries
	await go(diary);
	await shot(
		'diary',
		'Food diary',
		'Diary with entries',
		'Today is in progress, so under target stays neutral'
	);
	await page.getByRole('button', { name: 'Data sync' }).click();
	await page.waitForTimeout(1300);
	await shot('sync-drawer', 'Food diary', 'Sync drawer', 'Tap the cloud in the header');
	await page.getByRole('button', { name: 'Close' }).click();
	await page.waitForTimeout(700);
	await page.getByText('Greek yogurt').click();
	await page.waitForTimeout(1300);
	await shot('edit-food', 'Food diary', 'Edit entry', '/food-diary/:date/edit-food/:id');
	await page.getByRole('button', { name: 'Delete entry' }).click();
	await page.waitForURL(new RegExp(`${today}$`));
	await page.waitForTimeout(500);
	await shot('delete-undo', 'Food diary', 'After deleting an entry', 'Undo restores it');
	await page.getByRole('button', { name: 'Undo' }).click();
	await page.waitForTimeout(700);
	await shot('undo-highlight', 'Food diary', 'After Undo', 'The restored entry highlights briefly');
	await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
	await page.waitForTimeout(900);
	await shot('sidebar', 'Home', 'Navigation menu', 'Opened from the header');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(500);

	// ---- over the goal, then a finished day
	await mockChat(page);
	await logFromChat('pizza');
	await go(diary);
	await shot(
		'diary-over',
		'Food diary',
		'Diary, over the goal',
		'Amber arrow and a tick at the goal, never red'
	);
	await page.clock.setFixedTime(new Date(Date.now() + 3 * 86_400_000));
	await go(diary);
	await shot(
		'diary-finished',
		'Food diary',
		'A finished day',
		'Past days get a status chip judged against the goal'
	);

	// ---- settings and info pages
	await go('/settings');
	await shot('settings', 'Account', 'Settings', '/settings');
	await go('/account');
	await shot('account', 'Account', 'Account', '/account');
	await go('/docs');
	await shot('docs', 'Account', 'Docs', '/docs');
	await go('/privacy-policy');
	await shot('privacy', 'Account', 'Privacy policy', '/privacy-policy');
	await go('/terms-of-service');
	await shot('terms', 'Account', 'Terms of service', '/terms-of-service');

	// Controls under the 44px rule (DESIGN.md), listed per screen so a regression is easy to find.
	const report = Object.entries(smallTargets).map(
		([id, list]) => `${id}\n${list.map((l) => `  ${l}`).join('\n')}`
	);
	writeFileSync(join(dir, 'tap-targets.txt'), report.join('\n') || 'All tap targets reach 44px.');
	console.log(
		`[${theme}] ${report.length ? `Small tap targets on ${report.length} screens:\n${report.join('\n')}` : 'All tap targets reach 44px.'}`
	);

	// One theme describes the set; the gallery pairs the other by id.
	if (theme === 'light') {
		writeFileSync(
			join(OUT_DIR, 'manifest.json'),
			JSON.stringify({ ext: EXT, screens }, null, '\t')
		);
	}
});
