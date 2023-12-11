import clientPromise from "$lib/mongo/mongodb.js";
import type { WorkoutDocument } from "$lib/types/documents.js";
import { ObjectId } from "mongodb";

export const GET = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const workoutId = url.searchParams.get("workoutId");
  if (!workoutId) {
    return new Response("No workout ID given", { status: 400 });
  }

  const client = await clientPromise;
  const workoutDocument = await client
    .db()
    .collection<WorkoutDocument>("workouts")
    .findOne({ userId: new ObjectId(session.user.id), _id: new ObjectId(workoutId) });

  if (workoutDocument === null) {
    return new Response("Workout not found", { status: 404 });
  }
  return new Response(JSON.stringify(workoutDocument), { status: 200 });
};
