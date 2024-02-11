import clientPromise from "$lib/mongo/mongodb";
import { type FullConfig } from "@playwright/test";
import type { AdapterUser } from "@auth/core/adapters";

export default async function globalTeardown(config: FullConfig) {
  const client = await clientPromise;
  const testUsers = await client
    .db()
    .collection<AdapterUser>("users")
    .find({ email: /test-user-\w{24}@myfit\.com/ })
    .toArray();

  for (const user of testUsers) {
    await client.db().collection("users").deleteOne({ _id: user._id });
    await client.db().collection("sessions").deleteMany({ userId: user._id });
  }
}
