import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleDocument, WorkoutDocument } from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const { workoutId, performedMesocycleId }: APIWorkoutsDeleteWorkout = await request.json();
  const client = await clientPromise;
  try {
    if (performedMesocycleId !== null) {
      const performedMesocycle = await client
        .db()
        .collection<MesocycleDocument>("mesocycles")
        .findOneAndUpdate(
          {
            userId: new ObjectId(session.user.id),
            _id: new ObjectId(performedMesocycleId)
          },
          {
            $pullAll: { workouts: [new ObjectId(workoutId)] }
          }
        );

      if (!performedMesocycle) {
        return new Response("Performed mesocycle not found", { status: 400 });
      }
    }

    await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .deleteOne({ _id: new ObjectId(workoutId) });

    return new Response("Workout deleted successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
