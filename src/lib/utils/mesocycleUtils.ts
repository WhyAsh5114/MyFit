import { arrayAverage, averagePercentageChange } from '$lib/utils';
import type { WorkoutExercise, WorkoutsOfMesocycle } from './types';
import { getExerciseVolume } from './workoutUtils';

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
	return Object.entries(Object.groupBy(exercises ?? [], ({ name }) => name)).map(([name, exercises]) => ({
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

export function generatePerformanceChanges(workoutsOfMesocycle: WorkoutsOfMesocycle) {
	const allExercises = workoutsOfMesocycle.flatMap((wm) => wm.workout.workoutExercises);
	const groupedExercisesByMuscleGroup = groupExercisesByMuscleGroup(allExercises);

	const fullyGroupedExercises = groupedExercisesByMuscleGroup.map(({ muscleGroup, exercises }) => ({
		muscleGroup,
		exercises: groupExercisesByName(exercises)
	}));

	const performanceChangesPerMuscleGroups = fullyGroupedExercises.map(({ exercises, muscleGroup }) => ({
		muscleGroup,
		averageIncrease: arrayAverage(
			exercises.map(({ performances }) =>
				getAveragePercentageChangeOfExercisePerformances(performances, workoutsOfMesocycle)
			)
		)
	}));

	performanceChangesPerMuscleGroups.sort((a, b) => a.averageIncrease - b.averageIncrease);
	return performanceChangesPerMuscleGroups;
}
