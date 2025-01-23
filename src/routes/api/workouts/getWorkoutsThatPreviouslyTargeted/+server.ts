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

  const { muscleGroups, mesocycleId, beforeTimestamp }: APIGetWorkoutsThatPreviouslyTargeted =
    await request.json();
  const client = await clientPromise;
  try {
    const performedMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOne({
        userId: new ObjectId(session.user.id),
        _id: new ObjectId(mesocycleId)
      });

    if (!performedMesocycle) {
      return new Response("No active mesocycle found", { status: 400 });
    }

    const { exerciseSplit } = (await client
      .db()
      .collection<MesocycleTemplateDocument>("mesocycleTemplates")
      .findOne(
        {
          userId: new ObjectId(session.user.id),
          _id: performedMesocycle.templateMesoId
        },
        { projection: { exerciseSplit: 1 } }
      ))!;
    const workoutsCursor = client
      .db()
      .collection<WorkoutDocument>("workouts")
      .find(
        {
          userId: new ObjectId(session.user.id),
          performedMesocycleId: performedMesocycle._id,
          startTimestamp: { $lt: beforeTimestamp }
        },
        { limit: exerciseSplit.length }
      )
      .sort({ startTimestamp: -1 });
    const previouslyTargetedWorkouts: APIGetWorkoutsThatPreviouslyTargetedResponse = {};
    muscleGroups.forEach((muscleGroup) => {
      previouslyTargetedWorkouts[muscleGroup] = null;
    });

    while ((await workoutsCursor.hasNext()) && muscleGroups.length > 0) {
      const workout = await workoutsCursor.next();
      if (workout === null) {
        continue;
      }
      for (const muscleGroup of muscleGroups) {
        workout.exercisesPerformed.forEach(({ targetMuscleGroup }) => {
          if (
            muscleGroup === targetMuscleGroup &&
            previouslyTargetedWorkouts[muscleGroup] === null
          ) {
            previouslyTargetedWorkouts[muscleGroup] = workout._id.toString();
          }
        });
      }
    }

    return new Response(JSON.stringify(previouslyTargetedWorkouts), {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
