import type { ChangeType, MesocycleExerciseTemplate, Prisma, SetType } from '@prisma/client';

export type WorkoutExerciseInProgress = Omit<
	Prisma.WorkoutExerciseCreateWithoutWorkoutInput,
	'setData'
> & {
	setData:
		| StraightSetsInProgress
		| FixedChangeSetsInProgress
		| VariableChangeSetsInProgress
		| MyorepMatchSetsInProgress;
};

export type StraightSetsInProgress = Omit<
	Prisma.StraightSetsCreateWithoutSetsOfWorkoutExerciseInput,
	'load' | 'repNumbers' | 'RIRNumbers'
> & {
	load: number | undefined;
	repNumbers: (number | undefined)[];
	RIRNumbers: (number | undefined)[];
};

export type FixedChangeSetsInProgress = Omit<
	Prisma.FixedChangeSetsCreateWithoutSetsOfWorkoutExerciseInput,
	'loadNumbers' | 'repNumbers' | 'RIRNumbers'
> & {
	loadNumbers: (number | undefined)[];
	repNumbers: (number | undefined)[];
	RIRNumbers: (number | undefined)[];
};

export type VariableChangeSetsInProgress = Omit<
	Prisma.VariableChangeSetsCreateWithoutSetsOfWorkoutExerciseInput,
	'loadNumbers' | 'repNumbers' | 'RIRNumbers'
> & {
	loadNumbers: (number | undefined)[];
	repNumbers: (number | undefined)[];
	RIRNumbers: (number | undefined)[];
};

export type MyorepMatchSetsInProgress = Omit<
	Prisma.MyorepMatchSetsCreateWithoutSetsOfWorkoutExerciseInput,
	'myorepMatchSets'
> & {
	myorepMatchSets: (Omit<
		Prisma.MyorepMatchSetCreateWithoutMyorepMatchSetsInput,
		'repNumber' | 'loadNumber' | 'myoreps'
	> & {
		repNumber: number | undefined;
		loadNumber: number | undefined;
		myoreps: number[];
	})[];
};

type MesocycleExerciseTemplateSetData = {
	sets: number;
	setType: SetType;
	changeAmount: number | null;
	changeType: ChangeType | null;
};

type StraightSetData = {
	sets: number;
	setType: 'Straight' | 'Myorep';
	changeAmount: null;
	changeType: null;
};

function isStraightSetData(setData: MesocycleExerciseTemplateSetData): setData is StraightSetData {
	return setData.setType === 'Straight' || setData.setType === 'Myorep';
}

type FixedChangeSetData = {
	sets: number;
	setType: 'Drop' | 'Down' | 'Top';
	changeAmount: number;
	changeType: ChangeType;
};

function isFixedChangeSetData(
	setData: MesocycleExerciseTemplateSetData
): setData is FixedChangeSetData {
	return (
		(setData.setType === 'Down' || setData.setType === 'Drop' || setData.setType === 'Top') &&
		setData.changeAmount !== null &&
		setData.changeType !== null
	);
}

type VariableChangeSetData = {
	sets: number;
	setType: 'V2';
	changeAmount: null;
	changeType: null;
};

function isVariableChangeSetData(
	setData: MesocycleExerciseTemplateSetData
): setData is VariableChangeSetData {
	return setData.setType === 'V2';
}

export function createWorkoutExerciseInProgressFromMesocycleExerciseTemplate(
	exerciseTemplate: MesocycleExerciseTemplate
): WorkoutExerciseInProgress {
	const { sets, setType, changeAmount, changeType, mesocycleExerciseSplitDayId, ...exercise } =
		exerciseTemplate;
	const templateSetData = { sets, setType, changeAmount, changeType };
	const workoutSetData = createWorkoutSetDataFromMesocycleExerciseTemplateSetData(templateSetData);
	return { ...exercise, setData: workoutSetData };
}

function createWorkoutSetDataFromMesocycleExerciseTemplateSetData(
	setData: MesocycleExerciseTemplateSetData
) {
	if (isFixedChangeSetData(setData)) {
		const adjustedChangeAmount =
			setData.setType !== 'Top' ? setData.changeAmount! * -1 : setData.changeAmount;

		return {
			loadNumbers: Array(setData.sets).fill(undefined),
			repNumbers: Array(setData.sets).fill(undefined),
			RIRNumbers: Array(setData.sets).fill(undefined),
			changeAmount: adjustedChangeAmount,
			changeType: setData.changeType
		} satisfies FixedChangeSetsInProgress;
	}

	if (isStraightSetData(setData)) {
		return {
			load: undefined,
			repNumbers: Array(setData.sets).fill(undefined),
			RIRNumbers: Array(setData.sets).fill(undefined)
		} satisfies StraightSetsInProgress;
	}

	if (isVariableChangeSetData(setData)) {
		return {
			loadNumbers: Array(setData.sets).fill(undefined),
			repNumbers: Array(setData.sets).fill(undefined),
			RIRNumbers: Array(setData.sets).fill(undefined)
		} satisfies VariableChangeSetsInProgress;
	}

	if (setData.setType === 'MyorepMatch') {
		return {
			myorepMatchSets: Array.from({ length: setData.sets }).map(() => ({
				repNumber: undefined,
				loadNumber: undefined,
				myoreps: []
			}))
		} satisfies MyorepMatchSetsInProgress;
	}

	throw new Error('Invalid set data type');
}
