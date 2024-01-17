import clientPromise from "$lib/mongo/mongodb.js";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId, type Filter } from "mongodb";

const client = await clientPromise;

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const filter: Filter<WithUserId<Mesocycle>> = { userId: new ObjectId(session.user.id) };
    if (url.searchParams.has("active")) {
      filter.endTimestamp = null;
    }

    const mesocycles = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .find(filter)
      .toArray();
    
    console.log(mesocycles);

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
