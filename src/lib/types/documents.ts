import type { ObjectId } from "mongodb";

export type MesocycleTemplateDocument = MesocycleTemplate & { userId: ObjectId };

export type MesocycleDocument = {
  userId: ObjectId;
  startTimestamp: EpochTimeStamp;
  templateMesoId: ObjectId;
  workouts: (ObjectId | null)[];
  endTimestamp?: EpochTimeStamp;
};

export type WorkoutDocument = Workout & {
  userId: ObjectId;
  performedMesocycleId: ObjectId;
};

export type UserPreferencesDocument = UserPreferences & {
  userId: ObjectId;
};
