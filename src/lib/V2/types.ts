export const muscleGroups: typeof MuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Back',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves',
	'Abs',
	'Neck',
	'Adductors',
	'Abductors'
] as const;

export const exerciseWeightTypes: typeof ExerciseWeightTypes = ['Weighted', 'Bodyweight'] as const;

export const caloricStates: typeof CaloricStates = [
	{
		name: 'Hypo-caloric',
		commonTerm: 'Deficit',
		value: -1
	},
	{
		name: 'Iso-caloric',
		commonTerm: 'Maintenance',
		value: 0
	},
	{
		name: 'Hyper-caloric',
		commonTerm: 'Surplus',
		value: 1
	}
] as const;

export const workloadFeedback: typeof WorkloadFeedback = [
	{ name: 'none', value: 0, bgColorChecked: 'checked:!bg-warning', bgColor: 'bg-warning' },
	{ name: 'decent', value: 1, bgColorChecked: 'checked:!bg-accent', bgColor: 'bg-accent' },
	{
		name: 'pushed my limits',
		value: 2,
		bgColorChecked: 'checked:!bg-success',
		bgColor: 'bg-success'
	},
	{ name: 'too much work', value: 3, bgColorChecked: 'checked:!bg-error', bgColor: 'bg-error' }
];

export const sorenessFeedback: typeof SorenessFeedback = [
	{ name: 'none', value: 0, bgColorChecked: 'checked:!bg-warning', bgColor: 'bg-warning' },
	{ name: 'little bit', value: 1, bgColorChecked: 'checked:!bg-success', bgColor: 'bg-success' },
	{
		name: 'recovered on time',
		value: 2,
		bgColorChecked: 'checked:!bg-accent',
		bgColor: 'bg-accent'
	},
	{
		name: 'interfered with workout',
		value: 3,
		bgColorChecked: 'checked:!bg-error',
		bgColor: 'bg-error'
	}
] as const;

export const jointPainFeedback: typeof JointPainFeedback = [
	{ name: 'no pain', value: 0, bgColor: 'checked:!bg-success' },
	{ name: 'some pain', value: 1, bgColor: 'checked:!bg-warning' },
	{ name: 'it hurts', value: 2, bgColor: 'checked:!bg-error' }
] as const;

export const pumpFeedback: typeof PumpFeedback = [
	{ name: 'no pump', value: 0, bgColor: 'checked:!bg-warning' },
	{ name: 'decent pump', value: 1, bgColor: 'checked:!bg-success' },
	{ name: 'great pump', value: 2, bgColor: 'checked:!bg-accent' }
] as const;

import type { ObjectId } from 'mongodb';

export type MesocycleTemplateDocument = MesocycleTemplate & { userId: ObjectId };

export interface MesocycleDocument {
	userId: ObjectId;
	startTimestamp: EpochTimeStamp;
	templateMesoId: ObjectId;
	workouts: (ObjectId | null)[];
	endTimestamp?: EpochTimeStamp;
}

export type WorkoutDocument = Workout & {
	userId: ObjectId;
	performedMesocycleId: ObjectId;
};

export type UserPreferencesDocument = UserPreferences & {
	userId: ObjectId;
};

export const MuscleGroups = [
	'Chest',
	'Front delts',
	'Side delts',
	'Rear delts',
	'Back',
	'Traps',
	'Triceps',
	'Biceps',
	'Forearms',
	'Quads',
	'Hamstrings',
	'Glutes',
	'Calves',
	'Abs',
	'Neck',
	'Adductors',
	'Abductors'
] as const;
export type MuscleGroup = (typeof MuscleGroups)[number];

export const ExerciseWeightTypes = ['Weighted', 'Bodyweight'] as const;
export type ExerciseWeightType = (typeof ExerciseWeightTypes)[number];

export type WithSerializedId<T> = T & { id: string };

export const CaloricStates = [
	{
		name: 'Hypo-caloric',
		commonTerm: 'Deficit',
		value: -1
	},
	{
		name: 'Iso-caloric',
		commonTerm: 'Maintenance',
		value: 0
	},
	{
		name: 'Hyper-caloric',
		commonTerm: 'Surplus',
		value: 1
	}
] as const;

export type CaloricStateValue = (typeof CaloricStates)[number]['value'];

export type RIRProgressionData = {
	specificRIR: number;
	cycles: number;
};

export type MesocycleTemplate = {
	name: string;
	startRIR: number;
	RIRProgression: RIRProgressionData[];
	exerciseSplit: ({ name: string; exercises: SplitExercise[] } | null)[];
	caloricBalance: CaloricStateValue;
	specialization?: MuscleGroup[];
};

export type ActiveMesocycle = {
	templateMesoId: string;
	startTimestamp: EpochTimeStamp;
	workouts: (string | null)[];
};

export type Mesocycle = ActiveMesocycle & {
	endTimestamp?: EpochTimeStamp;
};

export type PerformedMesocycle = ActiveMesocycle & {
	endTimestamp: EpochTimeStamp;
};

interface SplitExercise {
	name: string;
	sets: number;
	targetMuscleGroup: MuscleGroup;
	repRangeStart: number;
	repRangeEnd: number;
	weightType: ExerciseWeightType;
	note?: string;
}

type Nullable<T> = {
	[P in keyof T]: T[P] | null;
};

interface AllUserPreferences {
	bodyweight: number;
}

export type UserPreferences = Nullable<AllUserPreferences>;

export const WorkloadFeedback = [
	{ name: 'none', value: 0, bgColorChecked: 'checked:!bg-warning', bgColor: 'bg-warning' },
	{ name: 'decent', value: 1, bgColorChecked: 'checked:!bg-accent', bgColor: 'bg-accent' },
	{
		name: 'pushed my limits',
		value: 2,
		bgColorChecked: 'checked:!bg-success',
		bgColor: 'bg-success'
	},
	{ name: 'too much work', value: 3, bgColorChecked: 'checked:!bg-error', bgColor: 'bg-error' }
];
export type WorkloadState = (typeof WorkloadFeedback)[number]['value'];

export const SorenessFeedback = [
	{ name: 'none', value: 0, bgColorChecked: 'checked:!bg-warning', bgColor: 'bg-warning' },
	{ name: 'little bit', value: 1, bgColorChecked: 'checked:!bg-success', bgColor: 'bg-success' },
	{
		name: 'recovered on time',
		value: 2,
		bgColorChecked: 'checked:!bg-accent',
		bgColor: 'bg-accent'
	},
	{
		name: 'interfered with workout',
		value: 3,
		bgColorChecked: 'checked:!bg-error',
		bgColor: 'bg-error'
	}
] as const;
export type SorenessState = (typeof SorenessFeedback)[number]['value'];

export type Workout = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: string | null;
	dayNumber: number;
	cycleNumber: number;
	difficultyRating: 1 | 2 | 3 | 4 | 5;
	exercisesPerformed: WorkoutExercise[];
	muscleGroupWorkloads: Partial<Record<MuscleGroup, WorkloadState | null>>;
	plannedRIR: number;
	muscleSorenessToNextWorkout: Partial<Record<MuscleGroup, SorenessState | null>>;
	deload: boolean;
	skipped: boolean;
};

export const JointPainFeedback = [
	{ name: 'no pain', value: 0, bgColor: 'checked:!bg-success' },
	{ name: 'some pain', value: 1, bgColor: 'checked:!bg-warning' },
	{ name: 'it hurts', value: 2, bgColor: 'checked:!bg-error' }
] as const;
export type JoinPainState = (typeof JointPainFeedback)[number]['value'];

export const PumpFeedback = [
	{ name: 'no pump', value: 0, bgColor: 'checked:!bg-warning' },
	{ name: 'decent pump', value: 1, bgColor: 'checked:!bg-success' },
	{ name: 'great pump', value: 2, bgColor: 'checked:!bg-accent' }
] as const;
export type PumpState = (typeof PumpFeedback)[number]['value'];

export type WorkoutExerciseSet = {
	reps: number;
	load: number;
	RIR: number;
};
export type WorkoutExercise = {
	name: string;
	sets: WorkoutExerciseSet[];
	repRangeStart: number;
	repRangeEnd: number;
	bodyweight?: number | null;
	targetMuscleGroup: MuscleGroup;
	jointPainRating: JoinPainState | null;
	pumpRating: PumpState | null;
	note?: string;
};

export type WorkoutExerciseWithoutSetNumbers = Omit<WorkoutExercise, 'sets'> & {
	sets: Nullable<WorkoutExerciseSet>[];
};

export type WorkoutBeingPerformed = {
	startTimestamp: EpochTimeStamp;
	referenceWorkout: string | null;
	dayNumber: number;
	cycleNumber: number;
	exercisesPerformed: WorkoutExerciseWithoutSetNumbers[];
	plannedRIR: number;
	deload: boolean;
};
