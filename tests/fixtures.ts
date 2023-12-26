/* eslint-disable @typescript-eslint/ban-types */
import { test as baseTest, expect } from "@playwright/test";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import path from "path";
import dotenv from "dotenv";
import clientPromise from "$lib/mongo/mongodb";
import { randomUUID } from "crypto";
import { ObjectId } from "bson";
import type { AdapterSession, AdapterUser } from "@auth/core/adapters";
dotenv.config();
const adapter = MongoDBAdapter(clientPromise, { databaseName: "MyFit_v3" });

async function createTestUserAndSession() {
  const randomUserName = new ObjectId().toString();
  const randomSessionToken = randomUUID();
  const newTestUser = await adapter.createUser({
    id: randomUserName,
    email: `test-user-${randomUserName}@myfit.com`,
    emailVerified: null
  });
  const newTestSession = await adapter.createSession({
    sessionToken: randomSessionToken,
    userId: randomUserName,
    expires: new Date(Number(new Date()) + 1000 * 60 * 60)
  });
  return { user: newTestUser, session: newTestSession };
}

async function deleteTestUserAndSession(user: AdapterUser, session: AdapterSession) {
  await adapter.deleteSession(session.sessionToken);
  await adapter.deleteUser(user.id);
}

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

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });
      const { user, session } = await createTestUserAndSession();

      // Perform authentication steps. Just set a test user's cookie.
      await page.context().addCookies([
        {
          name: "authjs.session-token",
          value: session.sessionToken,
          path: "/",
          domain: "localhost"
        }
      ]);
      // Wait until the page receives the cookies.
      // Reload to get user info
      await page.reload();
      await page.goto("localhost:4173/profile");
      await expect(page.getByRole("main")).toContainText(user.email);
      // End of authentication steps.

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);

      await deleteTestUserAndSession(user, session);
    },
    { scope: "worker" }
  ]
});
