import { arrayAverage, arraySum, averagePercentageChange } from '$lib/utils';
import type { Mesocycle, Workout, WorkoutExercise, WorkoutsOfMesocycle } from './types';
import { getExerciseVolume, getWorkoutVolume } from './workoutUtils';

type GroupedExercisesByMuscleGroup = {
	muscleGroup: string;
	exercises: WorkoutExercise[];
}[];

export function groupExercisesByMuscleGroup(exercises: WorkoutExercise[]): GroupedExercisesByMuscleGroup {
	const groupedObject = Object.groupBy(
		exercises,
		({ targetMuscleGroup, customMuscleGroup }) => customMuscleGroup ?? targetMuscleGroup
	);
	return Object.entries(groupedObject).map(([muscleGroup, exercises]) => ({
		muscleGroup,
		exercises: exercises ?? []
	}));
}

type GroupedExercisesByName = {
	name: string;
	performances: WorkoutExercise[];
}[];

export function groupExercisesByName(exercises: WorkoutExercise[]): GroupedExercisesByName {
	return Object.entries(Object.groupBy(exercises, ({ name }) => name)).map(([name, exercises]) => ({
		name,
		performances: exercises ?? []
	}));
}

export function getAveragePercentageChangeOfExercisePerformances(
	performances: WorkoutExercise[],
	workoutsOfMesocycle: WorkoutsOfMesocycle
) {
	const exerciseVolumes = performances.map((p) => {
		const workout = workoutsOfMesocycle.find((wm) => wm.workoutId === p.workoutId)?.workout;
		return getExerciseVolume(p, workout?.userBodyweight as number);
	});
	return averagePercentageChange(exerciseVolumes);
}

export function generatePerformanceChangesPerMuscleGroup(workoutsOfMesocycle: WorkoutsOfMesocycle) {
	const allExercises = workoutsOfMesocycle.flatMap((wm) => wm.workout.workoutExercises);
	const groupedExercisesByMuscleGroup = groupExercisesByMuscleGroup(allExercises);

	const fullyGroupedExercises = groupedExercisesByMuscleGroup.map(({ muscleGroup, exercises }) => ({
		muscleGroup,
		exercises: groupExercisesByName(exercises)
	}));

	const performanceChangesPerMuscleGroups = fullyGroupedExercises.map(({ exercises, muscleGroup }) => ({
		muscleGroup,
		averagePercentageChange: arrayAverage(
			exercises.map(({ performances }) =>
				getAveragePercentageChangeOfExercisePerformances(performances, workoutsOfMesocycle)
			)
		)
	}));

	performanceChangesPerMuscleGroups.sort((a, b) => a.averagePercentageChange - b.averagePercentageChange);
	return performanceChangesPerMuscleGroups;
}

type GroupedWorkoutsBySplitDayName = {
	splitDayName: string;
	workouts: Workout[];
}[];

export function groupWorkoutsBySplitDayName(
	workoutsOfMesocycle: WorkoutsOfMesocycle,
	splitDays: Mesocycle['mesocycleExerciseSplitDays']
): GroupedWorkoutsBySplitDayName {
	const groupedObject = Object.groupBy(workoutsOfMesocycle, ({ splitDayIndex }) => splitDayIndex);

	return Object.entries(groupedObject).map(([splitDayIndex, workoutsOfMesocycle]) => ({
		splitDayName: splitDays[Number(splitDayIndex)].name,
		workouts: (workoutsOfMesocycle ?? []).map((wm) => wm.workout)
	}));
}

export function generatePerformanceChangesPerSplitDay(mesocycle: Mesocycle) {
	const workoutsOfMesocycle = mesocycle.workoutsOfMesocycle.filter((wm) => wm.workoutStatus === null);
	const groupedWorkouts = groupWorkoutsBySplitDayName(workoutsOfMesocycle, mesocycle.mesocycleExerciseSplitDays);

	const performanceChangesPerSplitDay = groupedWorkouts.map(({ splitDayName, workouts }) => ({
		splitDayName,
		averagePercentageChange: averagePercentageChange(workouts.map((workout) => getWorkoutVolume(workout)))
	}));
	performanceChangesPerSplitDay.sort((a, b) => a.averagePercentageChange - b.averagePercentageChange);

	return performanceChangesPerSplitDay;
}

export function getSetsPerformedPerMuscleGroup(workoutsOfMesocycle: WorkoutsOfMesocycle) {
	const allExercises = workoutsOfMesocycle.flatMap((wm) => wm.workout.workoutExercises);
	const groupedExercisesByMuscleGroup = groupExercisesByMuscleGroup(allExercises);

	const setsPerformedPerMuscleGroup = groupedExercisesByMuscleGroup.map(({ exercises, muscleGroup }) => ({
		muscleGroup,
		totalSets: arraySum(exercises.map((exercise) => exercise.sets.length))
	}));
	setsPerformedPerMuscleGroup.sort((a, b) => a.totalSets - b.totalSets);

	return setsPerformedPerMuscleGroup;
}
