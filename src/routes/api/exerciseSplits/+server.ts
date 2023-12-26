import clientPromise from "$lib/mongo/mongodb.js";
import type { WithUserId } from "$lib/types/arrays";
import { ObjectId } from "mongodb";

export const GET = () => {};

export const POST = async ({ locals, request }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const exerciseSplit: ExerciseSplit = await request.json();
  const client = await clientPromise;
  
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
