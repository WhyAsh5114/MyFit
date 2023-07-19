/* eslint-disable @typescript-eslint/ban-types */
import { test as baseTest } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export * from '@playwright/test';
export const authTest = baseTest.extend<{}, { workerStorageState: string }>({
	// Use the same storage state for all tests in this worker.
	storageState: ({ workerStorageState }, use) => use(workerStorageState),

	// Authenticate once per worker with a worker-scoped fixture.
	workerStorageState: [
		async ({ browser }, use) => {
			// Use parallelIndex as a unique identifier for each worker.
			const id = authTest.info().parallelIndex;
			const fileName = path.resolve(authTest.info().project.outputDir, `.auth/${id}.json`);

			if (fs.existsSync(fileName)) {
				// Reuse existing authentication state if any.
				await use(fileName);
				return;
			}

			// Important: make sure we authenticate in a clean environment by unsetting storage state.
			const page = await browser.newPage({ storageState: undefined });

			// Acquire a unique account, for example create a new one.
			// Alternatively, you can have a list of precreated accounts for testing.
			// Make sure that accounts are unique, so that multiple team members
			// can run tests at the same time without interference.
			const account = { username: process.env.GITHUB_USERNAME as string, password: process.env.GITHUB_PASSWORD as string };

			// Perform authentication steps. Replace these actions with your own.
			await page.goto('http://localhost:4173/login');
			await page.getByRole('button', { name: 'Github logo Sign in with Github' }).click();
			await page.getByLabel('Username or email address').fill(account.username);
			await page.getByLabel('Password').fill(account.password);
			await page.getByRole('button', { name: 'Sign in' }).click();
			// Wait until the page receives the cookies.
			//
			// Sometimes login flow sets cookies in the process of several redirects.
			// Wait for the final URL to ensure that the cookies are actually set.
			await page.waitForURL('http://localhost:4173');

			// End of authentication steps.

			await page.context().storageState({ path: fileName });
			await page.close();
			await use(fileName);
		},
		{ scope: 'worker' }
	]
});
