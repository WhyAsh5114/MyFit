import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type {
  MesocycleDocument,
  MesocycleTemplateDocument,
  WorkoutDocument
} from "$lib/types/documents";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    return new Response("Invalid session", {
      status: 403
    });
  }

  const { workoutDayNumber }: APIWorkoutsGetReferenceWorkout = await request.json();
  const client = await clientPromise;
  try {
    const activeMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOne({
        userId: new ObjectId(session.user.id),
        endTimestamp: { $exists: false }
      });

    if (!activeMesocycle) {
      return new Response("No active mesocycle", { status: 400 });
    }

    const { exerciseSplit } = (await client
      .db()
      .collection<MesocycleTemplateDocument>("mesocycleTemplates")
      .findOne(
        {
          userId: new ObjectId(session.user.id),
          _id: activeMesocycle.templateMesoId
        },
        { projection: { exerciseSplit: 1 } }
      ))!;

    let referenceWorkoutDocument = await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .findOne(
        {
          userId: new ObjectId(session.user.id),
          performedMesocycleId: activeMesocycle._id,
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
