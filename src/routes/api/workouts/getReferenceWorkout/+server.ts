import type { RequestHandler } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId, type WithId } from "mongodb";
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

  const { workoutDayNumber }: APIWorkoutsGetReferenceWorkout = await request.json(),
    client = await clientPromise;
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
        ))!,
      activeMesocycleWorkouts = client
        .db()
        .collection<WorkoutDocument>("workouts")
        .find(
          {
            userId: new ObjectId(session.user.id),
            performedMesocycleId: activeMesocycle._id
          },
          { limit: exerciseSplit.length }
        )
        .sort({ startTimestamp: -1 });

    let referenceWorkoutDocument: WithId<WorkoutDocument> | undefined;
    for await (const workoutDocument of activeMesocycleWorkouts) {
      if (workoutDocument.dayNumber === workoutDayNumber) {
        referenceWorkoutDocument = workoutDocument;
        break;
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
