import { error } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import type {
  MesocycleDocument,
  WorkoutDocument,
  MesocycleTemplateDocument
} from "$lib/types/documents";
import { ObjectId, type WithId } from "mongodb";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, params, depends }) => {
  depends("workout:this");

  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  if (params.workoutId.length !== 24) {
    throw error(400, "Workout ID should be 24 character hex string");
  }

  const client = await clientPromise;
  const workoutDocument = await client
    .db()
    .collection<Omit<WorkoutDocument, "userId">>("workouts")
    .findOne(
      { userId: new ObjectId(session.user.id), _id: new ObjectId(params.workoutId) },
      { projection: { userId: 0 } }
    );

  if (!workoutDocument) {
    throw error(404, "Workout not found");
  }

  let referenceWorkout: WithSerializedId<Workout> | null = null;
  let referenceWorkoutDocument: WithId<WorkoutDocument> | null = null;
  if (workoutDocument.referenceWorkout) {
    referenceWorkoutDocument = await client
      .db()
      .collection<WorkoutDocument>("workouts")
      .findOne({
        _id: new ObjectId(workoutDocument.referenceWorkout),
        userId: new ObjectId(session.user.id)
      });
  }

  if (referenceWorkoutDocument) {
    const { _id, userId, performedMesocycleId, ...referenceWorkoutProps } =
      referenceWorkoutDocument;
    referenceWorkout = {
      id: _id.toString(),
      ...referenceWorkoutProps
    };
  }

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  let mesocycle: WithSerializedId<Mesocycle> | null = null;

  const { _id: workoutId, performedMesocycleId, ...workout } = workoutDocument;
  const performedMesocycleDocument = await client
    .db()
    .collection<Omit<MesocycleDocument, "userId">>("mesocycles")
    .findOne(
      { userId: new ObjectId(session.user.id), _id: performedMesocycleId },
      { projection: { userId: 0 } }
    );
  if (!performedMesocycleDocument) {
    return { workout, mesocycleTemplate, mesocycle, referenceWorkout };
  }

  mesocycle = {
    id: performedMesocycleDocument._id.toString(),
    templateMesoId: performedMesocycleDocument.templateMesoId.toString(),
    workouts: performedMesocycleDocument.workouts.map((workout) => workout?.toString() ?? null),
    startTimestamp: performedMesocycleDocument.startTimestamp,
    endTimestamp: performedMesocycleDocument.endTimestamp
  };

  const mesocycleTemplateDocument = await client
    .db()
    .collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
    .findOne(
      { userId: new ObjectId(session.user.id), _id: performedMesocycleDocument?.templateMesoId },
      { projection: { userId: 0 } }
    );
  if (!mesocycleTemplateDocument) {
    return { workout, mesocycleTemplate, referenceWorkout };
  }

  let { _id: mesocycleTemplateId, ...otherMesocycleTemplateProps } = mesocycleTemplateDocument;
  mesocycleTemplate = {
    id: mesocycleTemplateId.toString(),
    ...otherMesocycleTemplateProps
  };

  return { workout, mesocycle, mesocycleTemplate, referenceWorkout };
};
