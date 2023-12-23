import clientPromise from "$lib/mongo/mongodb";
import type { ObjectId } from "mongodb";
import dotenv from "dotenv";
import type { FullConfig } from "@playwright/test";
dotenv.config();

async function globalTeardown(config: FullConfig) {
  const client = await clientPromise;

  for (let i = 1; i <= config.workers; i++) {
    console.log("clearing test user" + i + " data");
    const sessionToken = process.env[`TEST_SESSION_${i}`];
    if (!sessionToken) break;

    const sessionDocument = await client.db().collection("sessions").findOne({ sessionToken });
    if (!sessionDocument) break;

    // Clear all test user generated data
    const userId = sessionDocument.userId as ObjectId;
    await client.db().collection("mesocycles").deleteMany({ userId });
    await client.db().collection("mesocycleTemplates").deleteMany({ userId });
    await client.db().collection("workouts").deleteMany({ userId });
    await client.db().collection("userPreferences").deleteOne({ userId });
  }
}

export default globalTeardown;
