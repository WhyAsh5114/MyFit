import { error } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import { ObjectId } from "mongodb";
import type {
  MesocycleDocument,
  MesocycleTemplateDocument,
  WorkoutDocument
} from "$lib/types/documents";

export const load = async ({ locals, params }) => {
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  if (params.mesocycleId.length !== 24) {
    throw error(400, "Mesocycle template ID should be 24 character hex string");
  }

  const client = await clientPromise;
  const mesocycleDocument = await client
    .db()
    .collection<MesocycleDocument>("mesocycles")
    .findOne({ _id: new ObjectId(params.mesocycleId), userId: new ObjectId(session.user.id) });

  if (mesocycleDocument === null) {
    throw error(404, "Mesocycle not found");
  }

  const { _id, userId, workouts, templateMesoId, ...mesocycleProps } = mesocycleDocument;
  const mesocycle: WithSerializedId<Mesocycle> = {
    id: _id.toString(),
    ...mesocycleProps,
    templateMesoId: templateMesoId.toString(),
    workouts: workouts.map((workout) => workout?.toString() ?? null)
  };
  const mesocycleTemplateDocument = await client
    .db()
    .collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
    .findOne(
      { userId: new ObjectId(session.user.id), _id: mesocycleDocument.templateMesoId },
      { projection: { userId: 0 } }
    );

  let mesocycleTemplate: WithSerializedId<MesocycleTemplate> | null = null;
  if (mesocycleTemplateDocument) {
    const { _id, ...otherProps } = mesocycleTemplateDocument;
    mesocycleTemplate = {
      id: _id.toString(),
      ...otherProps
    };
  }

  const workoutsCursor = client
    .db()
    .collection<Omit<WorkoutDocument, "userId">>("workouts")
    .find(
      {
        userId: new ObjectId(session.user.id),
        performedMesocycleId: mesocycleDocument._id
      },
      { projection: { userId: 0 }, sort: { startTimestamp: -1 } }
    )
    .map((workoutDocument) => {
      const { _id, performedMesocycleId, ...otherProps } = workoutDocument;
      const workout: WithSerializedId<Workout> & { performedMesocycleId: string } = {
        id: _id.toString(),
        performedMesocycleId: performedMesocycleId.toString(),
        ...otherProps
      };
      return workout;
    });
  const workoutsStreamArray = [];
  while (await workoutsCursor.hasNext()) {
    workoutsStreamArray.push(workoutsCursor.next());
  }

  return { mesocycle, mesocycleTemplate, streamed: { workoutsStreamArray } };
};
