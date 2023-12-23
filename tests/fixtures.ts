/* eslint-disable @typescript-eslint/ban-types */
import { test as baseTest } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

export * from "@playwright/test";
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);
      const testSession = process.env[`TEST_SESSION_${id + 1}`] ?? "";

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });

      // Perform authentication steps. Just set a test user's cookie.
      await page.context().addCookies([
        {
          name: "authjs.session-token",
          value: testSession,
          path: "/",
          domain: "localhost"
        }
      ]);
      // Wait until the page receives the cookies.
      // Reload to get user info
      await page.reload();
      // End of authentication steps.

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" }
  ]
});
