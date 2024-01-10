import clientPromise from "$lib/mongo/mongodb.js";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId } from "mongodb";

const client = await clientPromise;

export const GET = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const mesocycles = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    return new Response(JSON.stringify(mesocycles), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export const POST = async ({ locals, request }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const mesocycleWithoutTimestamp: Omit<Mesocycle, "startTimestamp"> = await request.json();
  try {
    await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .insertOne({
        ...mesocycleWithoutTimestamp,
        userId: new ObjectId(session.user.id),
        startTimestamp: Number(new Date())
      });

    return new Response("Mesocycle created successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};
