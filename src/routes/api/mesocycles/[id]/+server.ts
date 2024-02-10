import clientPromise from "$lib/mongo/mongodb";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId } from "mongodb";

const client = await clientPromise;

export const GET = async ({ params, locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const mesocycle = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .findOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) });

    if (mesocycle === null) {
      return new Response("Mesocycle not found", { status: 404 });
    }

    return new Response(JSON.stringify(mesocycle), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export const PUT = async ({ params, locals, request }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const newMesocycle = (await request.json()) as Mesocycle;

  try {
    const updateResult = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .replaceOne(
        { userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) },
        { userId: new ObjectId(session.user.id), ...newMesocycle }
      );

    if (updateResult.modifiedCount === 0) {
      return new Response("Mesocycle not found", { status: 404 });
    }

    return new Response("Mesocycle updated successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export const DELETE = async ({ params, locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const deleteResult = await client
      .db()
      .collection<WithUserId<Mesocycle>>("mesocycles")
      .deleteOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) });

    if (deleteResult.deletedCount === 0) {
      return new Response("Mesocycle not found", { status: 404 });
    }

    return new Response("Mesocycle deleted successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};
