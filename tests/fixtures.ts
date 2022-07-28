import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createClient } from 'redis';

const Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function generateRandomPhrase(length: number) {
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
	splitWorkoutsLoadedPage: Page;
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
				username = 'user' + generateRandomPhrase(5);
			} while ((await client.get(username)) !== null);
			await use(username);
		},
		{ scope: 'test' }
	],
	registeredAccount: [
		async ({ creatableUsername, request }, use) => {
			const randomPassword = generateRandomPhrase(10);
			const credentials: AccountDetails = {
				username: creatableUsername,
				password: randomPassword
			};
			const registerRes = await request.post('/api/auth/register', {
				data: credentials
			});
			expect(registerRes.ok()).toStrictEqual(true);
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
			const loginRes = await page.request.post('/api/auth/login', {
				data: {
					username: user.username,
					password: user.password
				}
			});
			expect(loginRes.ok()).toStrictEqual(true);
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
				splitWorkouts: {
					Push: [
						{ id: 1, name: 'Bench press', reps: 5, sets: 3, load: 25 },
						{ id: 2, name: 'Shoulder press', reps: 12, sets: 3, load: 15 },
						{ id: 3, name: 'Incline dumbbell press', reps: 12, sets: 3, load: 15 },
						{ id: 4, name: 'Triceps pushdowns', reps: 12, sets: 3, load: 15 },
						{ id: 5, name: 'Lateral raises', reps: 20, sets: 3, load: 5 },
						{ id: 6, name: 'Overhead triceps extensions', reps: 12, sets: 3, load: 10 }
					],
					Pull: [
						{ id: 1, name: 'Deadlifts', reps: 5, sets: 3, load: 50 },
						{ id: 2, name: 'Pull ups', reps: 12, sets: 3, load: 40 },
						{ id: 3, name: 'Cable rows', reps: 12, sets: 3, load: 15 },
						{ id: 4, name: 'Face pulls', reps: 15, sets: 5, load: 10 },
						{ id: 5, name: 'Hammer curls', reps: 12, sets: 4, load: 10 },
						{ id: 6, name: 'Dumbbell curls', reps: 12, sets: 4, load: 10 }
					],
					Legs: [
						{ id: 1, name: 'Squat', reps: 5, sets: 3, load: 25 },
						{ id: 2, name: 'Romanian deadlifts', reps: 12, sets: 3, load: 20 },
						{ id: 3, name: 'Leg press', reps: 12, sets: 3, load: 100 },
						{ id: 4, name: 'Leg curls', reps: 12, sets: 3, load: 15 },
						{ id: 5, name: 'Calf raises', reps: 12, sets: 5, load: 15 },
					]
				}
			};

			await use(split);
		},
		{ scope: 'test' }
	],
	splitStoreLoadedPage: [
		async ({ loggedInPage, split }, use) => {
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
	],
	splitWorkoutsLoadedPage: [
		async ({ splitStoreLoadedPage, split}, use) => {
			const page = splitStoreLoadedPage;

			const uniqueWorkouts = new Set<string>;
			for (const workout of split.schedule) {
				if (workout !== 'Rest') {
					uniqueWorkouts.add(workout);
				}
			}

			for (const workout of uniqueWorkouts) {
				for (const day of Days) {
					const workoutElement = page.locator(`p[data-test-id=workout-${day}]`)
					const currentWorkout = await workoutElement.textContent() as string;
					if (currentWorkout === workout) {
						await workoutElement.click();
						await expect(page.locator('[data-test-id=workout-name]')).toHaveText(workout)
					}
				}
				const exercises = split.splitWorkouts[workout];
				for (const exercise of exercises) {
					await page.locator('button[data-test-id=add-button]').click();
					await page.fill('input[data-test-id=name-input]', exercise.name);
					await page.fill('input[data-test-id=reps-input]', exercise.reps.toString());
					await page.fill('input[data-test-id=sets-input]', exercise.sets.toString());
					await page.fill('input[data-test-id=load-input]', exercise.load.toString());
					await page.locator('button[data-test-id=save-button]').click();
				}
			}
			
			await use(page);
		},
		{ scope: 'test' }
	]
});

export { expect } from '@playwright/test';
