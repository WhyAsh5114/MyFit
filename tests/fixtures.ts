/* eslint-disable @typescript-eslint/ban-types */
import { test as baseTest } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import clientPromise from "$lib/mongo/mongodb";
import type { ObjectId } from "mongodb";
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

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });
      const testSession = process.env[`TEST_SESSION_${id + 1}`] ?? "";

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

      // Clear test user state
      const client = await clientPromise;
      const sessionDocument = await client
        .db()
        .collection("sessions")
        .findOne({ sessionToken: testSession });
      if (!sessionDocument) return;

      // Clear all test user generated data
      const userId = sessionDocument.userId as ObjectId;
      await client.db().collection("mesocycles").deleteMany({ userId });
      await client.db().collection("mesocycleTemplates").deleteMany({ userId });
      await client.db().collection("workouts").deleteMany({ userId });
      await client.db().collection("userPreferences").deleteOne({ userId });
    },
    { scope: "worker" }
  ]
});
