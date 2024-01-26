import clientPromise from "$lib/mongo/mongodb.js";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId, type Filter } from "mongodb";

const client = await clientPromise;

export const GET = async ({ locals, url }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const filter: Filter<WithUserId<Mesocycle>> = { userId: new ObjectId(session.user.id) };
    if (url.searchParams.has("active")) {
      filter.startTimestamp = { $ne: null };
      filter.endTimestamp = null;
    }

    const mesocycles = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .find(filter)
      .toArray();

    return new Response(JSON.stringify(mesocycles), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export type POSTRequestBody = {
  currentMesocycle: Omit<Mesocycle, "startTimestamp">;
  startNow: boolean;
};

export const POST = async ({ locals, request, fetch }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const { currentMesocycle: mesocycleWithoutTimestamp, startNow }: POSTRequestBody =
    await request.json();

  try {
    if (startNow) {
      const response = await fetch("/api/mesocycles?active");
      const activeMesocycle: WithSID<WithUserId<Mesocycle>> | undefined = (
        await response.json()
      )[0];
      if (activeMesocycle) {
        await client
          .db()
          .collection<WithUserId<Mesocycle>>("mesocycles")
          .updateOne(
            { _id: new ObjectId(activeMesocycle._id), userId: new ObjectId(session.user.id) },
            { $set: { endTimestamp: Number(new Date()) } }
          );
      }
    }

    await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .insertOne({
        ...mesocycleWithoutTimestamp,
        userId: new ObjectId(session.user.id),
        startTimestamp: startNow ? Number(new Date()) : null
      });

    return new Response("Mesocycle created successfully", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
};
