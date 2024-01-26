import clientPromise from "$lib/mongo/mongodb.js";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId } from "mongodb";

const client = await clientPromise;

export const GET = async ({ locals }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  try {
    const exerciseSplits = await client
      .db()
      .collection<WithUserId<ExerciseSplit>>("exerciseSplits")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    return new Response(JSON.stringify(exerciseSplits), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export const POST = async ({ locals, request }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const exerciseSplit: ExerciseSplit = await request.json();
  try {
    await client
      .db()
      .collection<WithUserId<ExerciseSplit>>("exerciseSplits")
      .insertOne({ ...exerciseSplit, userId: new ObjectId(session.user.id) });

    return new Response("Exercise split created successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};
