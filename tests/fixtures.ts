import { test as baseTest, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import type { UserData } from './global-setup';

dotenv.config();
const prisma = new PrismaClient();

export async function deleteUserData(userId: string) {
	await prisma.mesocycle.deleteMany({ where: { userId } });
	await prisma.exerciseSplit.deleteMany({ where: { userId } });
	await prisma.workout.deleteMany({ where: { userId } });
}

export * from '@playwright/test';
export const test = baseTest.extend<{ autoTestFixture: string }, { workerStorageState: string; userData: UserData }>({
	// Use the same storage state for all tests in this worker.
	storageState: ({ workerStorageState }, use) => use(workerStorageState),
	userData: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			// Use parallelIndex as a unique identifier for each worker.
			const userData = JSON.parse(process.env.TEST_USERS_DATA as string)[test.info().parallelIndex];
			await use(userData);
		},
		{ scope: 'worker' }
	],

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [
		async ({ browser, userData }, use) => {
			const { userId, sessionToken } = userData;

			// Use parallelIndex as a unique identifier for each worker.
			const id = test.info().parallelIndex;
			const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

			// Important: make sure we authenticate in a clean environment by unsetting storage state.
			const page = await browser.newPage({ storageState: undefined });

			// Perform authentication steps. Just set a test user's cookie.
			await page.context().addCookies([
				{
					name: 'authjs.session-token',
					value: sessionToken,
					path: '/',
					domain: 'localhost'
				}
			]);
			// Wait until the page receives the cookies.
			// Reload to get user info
			await page.reload();
			await page.goto('localhost:4173/profile');
			await expect(page.getByRole('main')).toContainText(userId);
			// End of authentication steps.

			await page.context().storageState({ path: fileName });
			await page.close();
			await use(fileName);
		},
		{ scope: 'worker' }
	],

	autoTestFixture: [
		async ({ userData }, use) => {
			// Clear user data for each test, once before each test should be enough
			await deleteUserData(userData.userId);
			await use('autoTestFixture');
		},
		{ scope: 'test', auto: true }
	]
});
