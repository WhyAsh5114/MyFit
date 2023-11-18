import type { ObjectId } from "mongodb";

export type MesocycleTemplateDocument = MesocycleTemplate & { userId: ObjectId };
export type ActiveMesocycleDocument = {
	userId: ObjectId;
	startDate: EpochTimeStamp;
	templateMesoId: ObjectId;
	workouts: ObjectId[];
};
