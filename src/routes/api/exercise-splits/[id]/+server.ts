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
    const exerciseSplit = await client
      .db()
      .collection<WithUserId<ExerciseSplit>>("exerciseSplits")
      .findOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) });

    if (exerciseSplit === null) {
      return new Response("Exercise split not found", { status: 404 });
    }

    return new Response(JSON.stringify(exerciseSplit), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};

export const PUT = async ({ params, locals, request }) => {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const newExerciseSplit = (await request.json()) as ExerciseSplit;

  try {
    const updateResult = await client
      .db()
      .collection<WithUserId<ExerciseSplit>>("exerciseSplits")
      .replaceOne(
        { userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) },
        { userId: new ObjectId(session.user.id), ...newExerciseSplit }
      );

    if (updateResult.modifiedCount === 0) {
      return new Response("Exercise split not found", { status: 404 });
    }

    return new Response("Exercise split updated successfully", { status: 200 });
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
      .collection<WithUserId<ExerciseSplit>>("exerciseSplits")
      .deleteOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(params.id) });

    if (deleteResult.deletedCount === 0) {
      return new Response("Exercise split not found", { status: 404 });
    }

    return new Response("Exercise split deleted successfully", { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
};
