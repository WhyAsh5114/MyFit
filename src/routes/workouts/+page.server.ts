import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import clientPromise from "$lib/mongo/mongodb";
import type {
  MesocycleDocument,
  MesocycleTemplateDocument,
  WorkoutDocument
} from "$lib/types/documents";
import { ObjectId } from "mongodb";

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends("workout:all", "mesocycle:templates", "mesocycle:usages");
  const session = await locals.getSession();
  if (!session?.user?.id) {
    throw error(403, "Not logged in");
  }

  const client = await clientPromise,
    mesocycleCursor = client
      .db()
      .collection<Omit<MesocycleDocument, "userId">>("mesocycles")
      .find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
      .map((mesocycleDocument) => {
        const { _id, templateMesoId, workouts, ...otherProps } = mesocycleDocument,
          mesocycle: WithSerializedId<Mesocycle> = {
            id: _id.toString(),
            ...otherProps,
            templateMesoId: templateMesoId.toString(),
            workouts: workouts.map((workout) => workout?.toString() ?? null)
          };
        return mesocycle;
      }),
    mesocyclesStreamArray = [];
  while (await mesocycleCursor.hasNext()) {
    mesocyclesStreamArray.push(mesocycleCursor.next());
  }

  const mesocycleTemplateCursor = client
      .db()
      .collection<Omit<MesocycleTemplateDocument, "userId">>("mesocycleTemplates")
      .find({ userId: new ObjectId(session.user.id) }, { projection: { userId: 0 } })
      .map((mesocycleTemplateDocument) => {
        const { _id, ...otherProps } = mesocycleTemplateDocument,
          mesocycleTemplate: WithSerializedId<MesocycleTemplate> = {
            id: mesocycleTemplateDocument._id.toString(),
            ...otherProps
          };
        return mesocycleTemplate;
      }),
    mesocycleTemplatesStreamArray = [];
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
        const { _id, performedMesocycleId, ...otherProps } = workoutDocument,
          workout: WithSerializedId<Workout> & { performedMesocycleId: string } = {
            id: _id.toString(),
            performedMesocycleId: performedMesocycleId.toString(),
            ...otherProps
          };
        return workout;
      }),
    workoutsStreamArray = [];
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
