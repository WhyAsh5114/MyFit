import { error } from "@sveltejs/kit";
import clientPromise from "$lib/mongo/mongodb";
import type {
  MesocycleDocument,
  MesocycleTemplateDocument,
  WorkoutDocument
} from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load = async ({ depends, locals }) => {
  depends("workout:all", "mesocycle:templates", "mesocycle:usages");
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const client = await clientPromise;
  const mesocycleCursor = client
    .db()
    .collection<Omit<MesocycleDocument, "userId">>("mesocycles")
    .find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
    .map((mesocycleDocument) => {
      const { _id, templateMesoId, workouts, ...otherProps } = mesocycleDocument;
      const mesocycle: WithSerializedId<Mesocycle> = {
        id: _id.toString(),
        ...otherProps,
        templateMesoId: templateMesoId.toString(),
        workouts: workouts.map((workout) => workout?.toString() ?? null)
      };
      return mesocycle;
    });
  const mesocyclesStreamArray = [];
  while (await mesocycleCursor.hasNext()) {
    mesocyclesStreamArray.push(mesocycleCursor.next());
  }

  const mesocycleTemplateCursor = client
    .db()
    .collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
    .find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
    .map((mesocycleTemplateDocument) => {
      const { _id, ...otherProps } = mesocycleTemplateDocument;
      const mesocycleTemplate: WithSerializedId<MesocycleTemplate> = {
        id: mesocycleTemplateDocument._id.toString(),
        ...otherProps
      };
      return mesocycleTemplate;
    });
  const mesocycleTemplatesStreamArray = [];
  while (await mesocycleTemplateCursor.hasNext()) {
    mesocycleTemplatesStreamArray.push(mesocycleTemplateCursor.next());
  }

  const workoutsCursor = client
    .db()
    .collection<Omit<WorkoutDocument, "userId">>("workouts")
    .find(
      { userId: new ObjectId(session.user.id) },
      { sort: { startTimestamp: -1 }, projection: { userId: 0 } }
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

  return {
    streamed: {
      mesocyclesStreamArray,
      mesocycleTemplatesStreamArray,
      workoutsStreamArray
    }
  };
};
