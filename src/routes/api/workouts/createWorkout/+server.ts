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

  const { workout, previousSoreness }: APIWorkoutsSaveWorkout = await request.json(),
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
      return new Response("No active mesocycle found", { status: 400 });
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
      workoutsCursor = client
        .db()
        .collection<WorkoutDocument>("workouts")
        .find(
          { userId: new ObjectId(session.user.id), performedMesocycleId: activeMesocycle._id },
          { limit: exerciseSplit.length }
        )
        .sort({ startTimestamp: -1 });

    while ((await workoutsCursor.hasNext()) && Object.keys(previousSoreness).length > 0) {
      const workout = await workoutsCursor.next();
      if (workout === null) {
        continue;
      }
      let workoutChanged = false;
      for (const [muscleGroup, sorenessValue] of Object.entries(previousSoreness)) {
        for (const { targetMuscleGroup } of workout.exercisesPerformed) {
          if (muscleGroup === targetMuscleGroup) {
            workout.muscleSorenessToNextWorkout[muscleGroup] = sorenessValue;
            workoutChanged = true;
            delete previousSoreness[muscleGroup];
          }
        }
      }
      if (workoutChanged) {
        await client
          .db()
          .collection<WorkoutDocument>("workouts")
          .updateOne(
            { _id: workout._id },
            { $set: { muscleSorenessToNextWorkout: workout.muscleSorenessToNextWorkout } }
          );
      }
    }

    const savedWorkout = await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .insertOne({
        userId: new ObjectId(session.user.id),
        performedMesocycleId: activeMesocycle._id,
        ...workout
      });

    await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .updateOne({ _id: activeMesocycle._id }, { $push: { workouts: savedWorkout.insertedId } });

    return new Response("Workout saved successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
