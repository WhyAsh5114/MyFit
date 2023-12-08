interface APIMesocyclesCreateTemplate {
  mesocycleTemplate: MesocycleTemplate;
}

interface APIMesocyclesDeleteTemplate {
  mesocycleTemplateId: string;
}

interface APIMesocyclesStartMesocycle {
  mesocycleTemplateId: string;
}

interface APIMesocyclesStopMesocycle {
  activeMesocycleId: string;
}

interface APIWorkoutsGetReferenceWorkout {
  workoutDayNumber: number;
}

type APIUserUpdatePreferences = Partial<UserPreferences>;

interface APIWorkoutsSaveWorkout {
  workout: Workout;
  previousSoreness: Workout["muscleSorenessToNextWorkout"];
}

interface APIWorkoutsUpdateWorkout {
  workoutId: string;
  workout: Workout;
  previousSoreness: Workout["muscleSorenessToNextWorkout"];
  performedMesocycleId: string;
}

interface APIGetWorkoutsThatPreviouslyTargeted {
  muscleGroups: MuscleGroup[];
  mesocycleId: string;
  beforeTimestamp: EpochTimeStamp;
}
type APIGetWorkoutsThatPreviouslyTargetedResponse = Partial<Record<MuscleGroup, string | null>>;

type APIGetPreviousSorenessValues = APIGetWorkoutsThatPreviouslyTargeted;

interface APIWorkoutsDeleteWorkout {
  workoutId: string;
  performedMesocycleId: string;
}
