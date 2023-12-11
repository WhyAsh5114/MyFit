import clientPromise from "$lib/mongo/mongodb.js";
import type { WorkoutDocument } from "$lib/types/documents.js";
import { ObjectId, type Filter } from "mongodb";

export const GET = async ({ locals, url, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Not logged in", { status: 403 });
  }

  const page = parseInt(url.searchParams.get("page") ?? "");
  let skip: number | undefined = undefined;
  if (page >= 0) skip = page * 10;

  const filter: Filter<WorkoutDocument> = { userId: new ObjectId(session.user.id) };
  const mesocycleId = url.searchParams.get("mesocycleId");
  const mesocycleTemplateId = url.searchParams.get("mesocycleTemplateId");

  if (mesocycleId) {
    filter.performedMesocycleId = new ObjectId(mesocycleId);
  } else if (mesocycleTemplateId) {
    const getAllMesocyclesResponse = await fetch(
      `/api/mesocycles/getAllMesocycles?mesocycleTemplateId=${mesocycleTemplateId}`
    );
    const mesocycles = await getAllMesocyclesResponse.json();
    const mesocycleIds = mesocycles.map(
      (mesocycle: WithSerializedId<Mesocycle>) => new ObjectId(mesocycle._id)
    );
    if (getAllMesocyclesResponse.ok) {
      filter.performedMesocycleId = { $in: mesocycleIds };
    }
  }

  const client = await clientPromise;
  const count = await client.db().collection("workouts").countDocuments(filter);
  const workoutsCursor = client
    .db()
    .collection<WorkoutDocument>("workouts")
    .find(filter, { sort: { startTimestamp: -1 } });
  if (skip !== undefined) workoutsCursor.skip(skip).limit(10);

  return new Response(JSON.stringify({ workouts: await workoutsCursor.toArray(), count }), {
    status: 200
  });
};
