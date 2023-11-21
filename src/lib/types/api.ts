type APIMesocyclesCreateTemplate = {
	mesocycleTemplate: MesocycleTemplate;
};

type APIMesocyclesDeleteTemplate = {
	mesocycleTemplateId: string;
};

type APIMesocyclesStartMesocycle = {
	mesocycleTemplateId: string;
};

type APIMesocyclesStopMesocycle = {
	activeMesocycleId: string;
};

type APIWorkoutsGetReferenceWorkout = {
	workoutName: string;
};

type APIUserUpdatePreferences = Partial<UserPreferences>;
