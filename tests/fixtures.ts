import { test as baseTest, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import cuid from 'cuid';
import type { AdapterSession, AdapterUser } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

dotenv.config();
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

async function createTestUserAndSession() {
	const randomUserName = cuid();
	const randomSessionToken = randomUUID();
	const newTestSession = await prisma.session.create({
		data: {
			sessionToken: randomSessionToken,
			expires: new Date(Number(new Date()) + 1000 * 60 * 60),
			user: {
				create: {
					id: randomUserName,
					email: `test-user-${randomUserName}@myfit.com`,
					emailVerified: null
				}
			}
		}
	});
	const newTestUser = await prisma.user.findFirst({ where: { id: newTestSession.userId } });
	if (newTestUser === null) throw new Error("User couldn't be found after session creation");
	return { user: newTestUser, session: newTestSession };
}

async function deleteTestUserAndSession(user: AdapterUser, session: AdapterSession) {
	// @ts-expect-error idk why, always works though
	await adapter.deleteSession(session.sessionToken);
	// @ts-expect-error idk why, always works though
	await adapter.deleteUser(user.id);
}

export async function deleteUserData(userId: string) {
	await prisma.exerciseSplit.deleteMany({ where: { userId } });
	await prisma.mesocycle.deleteMany({ where: { userId } });
}

export * from '@playwright/test';
export const test = baseTest.extend<
	{ autoTestFixture: string },
	{ workerStorageState: string; userAndSession: { user: AdapterUser; session: AdapterSession } }
>({
	// Use the same storage state for all tests in this worker.
	storageState: ({ workerStorageState }, use) => use(workerStorageState),
	userAndSession: [await createTestUserAndSession(), { scope: 'worker' }],

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [
		async ({ browser, userAndSession }, use) => {
			// Get from userAndSession (different account for each worker)
			const { user, session } = userAndSession;

			// Use parallelIndex as a unique identifier for each worker.
			const id = test.info().parallelIndex;
			const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

			// Important: make sure we authenticate in a clean environment by unsetting storage state.
			const page = await browser.newPage({ storageState: undefined });

			// Perform authentication steps. Just set a test user's cookie.
			await page.context().addCookies([
				{
					name: 'authjs.session-token',
					value: session.sessionToken,
					path: '/',
					domain: 'localhost'
				}
			]);
			// Wait until the page receives the cookies.
			// Reload to get user info
			await page.reload();
			await page.goto('localhost:4173/profile');
			await expect(page.getByRole('main')).toContainText(user.email);
			// End of authentication steps.

			await page.context().storageState({ path: fileName });
			await page.close();
			await use(fileName);

			// Delete the account and session
			await deleteTestUserAndSession(user, session);
		},
		{ scope: 'worker' }
	],

	autoTestFixture: [
		async ({ userAndSession }, use) => {
			// Clear user data for each test, once before each test should be enough
			await deleteUserData(userAndSession.user.id);
			await use('autoTestFixture');
		},
		{ scope: 'test', auto: true }
	]
});
