import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type { MesocycleDocument, WorkoutDocument } from "$lib/types/documents";

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const workoutDayNumber = parseInt(url.searchParams.get("workoutDayNumber") ?? "");
  if (isNaN(workoutDayNumber)) {
    return new Response("Invalid workout day number given", { status: 400 });
  }

  const client = await clientPromise;
  try {
    let activeMesocycle: WithSerializedId<MesocycleDocument> | null = null;
    const getActiveMesocycleResponse = await fetch("/api/mesocycles/getActiveMesocycle");
    if (!getActiveMesocycleResponse.ok) {
      return getActiveMesocycleResponse;
    }
    activeMesocycle =
      (await getActiveMesocycleResponse.json()) as WithSerializedId<MesocycleDocument>;

    let referenceWorkoutDocument = await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .findOne(
        {
          userId: new ObjectId(session.user.id),
          performedMesocycleId: new ObjectId(activeMesocycle._id),
          dayNumber: workoutDayNumber
        },
        {
          sort: ["startTimestamp", -1]
        }
      );

    // Find actual reference workout (not skipped workout) if exists
    if (referenceWorkoutDocument?.skipped === true) {
      // If no reference even in skipped workout, no actual workout exists
      if (!referenceWorkoutDocument.referenceWorkout) {
        referenceWorkoutDocument = null;
      } else {
        // Get the real reference workout
        referenceWorkoutDocument = await client
          .db()
          .collection<WorkoutDocument>("workouts")
          .findOne({ _id: new ObjectId(referenceWorkoutDocument.referenceWorkout) });
      }
    }
    if (!referenceWorkoutDocument) {
      return new Response("Reference workout not found", { status: 404 });
    }

    return new Response(JSON.stringify(referenceWorkoutDocument), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify(e), { status: 500 });
  }
};
