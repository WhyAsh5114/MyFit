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

  const { workoutId, performedMesocycleId, workout, previousSoreness }: APIWorkoutsUpdateWorkout =
    await request.json();
  const client = await clientPromise;
  try {
    const performedMesocycle = await client
      .db()
      .collection<MesocycleDocument>("mesocycles")
      .findOne({
        userId: new ObjectId(session.user.id),
        _id: new ObjectId(performedMesocycleId)
      });

    if (!performedMesocycle) {
      return new Response("Performed mesocycle not found", { status: 400 });
    }

    const savedWorkout = await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .findOne({
        userId: new ObjectId(session.user.id),
        _id: new ObjectId(workoutId)
      });

    if (savedWorkout === null) {
      return new Response("Workout not found", { status: 404 });
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
      )) as WithId<MesocycleTemplateDocument>;

    const workoutsCursor = client
      .db()
      .collection<WorkoutDocument>("workouts")
      .find(
        {
          userId: new ObjectId(session.user.id),
          performedMesocycleId: performedMesocycle._id,
          startTimestamp: { $lt: savedWorkout.startTimestamp }
        },
        { limit: exerciseSplit.length }
      )
      .sort({ startTimestamp: -1 });

    while ((await workoutsCursor.hasNext()) && Object.keys(previousSoreness).length > 0) {
      const workout = await workoutsCursor.next();
      if (workout === null) continue;
      let workoutChanged = false;
      for (const [muscleGroup, sorenessValue] of Object.entries(previousSoreness)) {
        workout.exercisesPerformed.forEach(({ targetMuscleGroup }) => {
          if (muscleGroup === targetMuscleGroup) {
            workout.muscleSorenessToNextWorkout[muscleGroup] = sorenessValue;
            workoutChanged = true;
            delete previousSoreness[muscleGroup];
          }
        });
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

    await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .updateOne({ _id: new ObjectId(workoutId) }, { $set: { ...workout } });

    return new Response("Workout updated successfully", {
      status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500
    });
  }
};
