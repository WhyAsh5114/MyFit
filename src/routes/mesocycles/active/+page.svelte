<script lang="ts">
	import { dateFormatter, commonMuscleGroups } from '$lib/commonDB.js';
	import MuscleGroupComponent from '$lib/components/mesocycle/MuscleGroupComponent.svelte';
	import BestExercises from './BestExercises.svelte';
	import ExerciseChart from './ExerciseChart.svelte';
	import VolumeChart from './VolumeChart.svelte';

	export let data;
	let currentWeek = 1;

	let performedMesoWorkouts: (Workout | null)[] = [];
	data.activeMesocycle.workouts.forEach((workoutIndex) => {
		performedMesoWorkouts.push(data.workouts[workoutIndex]);
	});

	let weeklyWorkoutData: WorkoutDataByWeek[] = [];
	for (let i = 1; i <= data.parentMesocycle.duration; i++) {
		let weekWorkoutData: WorkoutDataByWeek = { week: i, allMuscleGroupData: [] };
		commonMuscleGroups.forEach((muscleGroup) => {
			weekWorkoutData.allMuscleGroupData.push({ muscleGroup, volume: 0, freq: 0 });
		});
		weeklyWorkoutData.push(weekWorkoutData);
	}

	performedMesoWorkouts.forEach((workout) => {
		if (!workout) return;

		const musclesTargetedInWorkouts: Set<(typeof commonMuscleGroups)[number]> = new Set();
		const weekWorkoutData = weeklyWorkoutData.find(
			(weekWorkoutData) => weekWorkoutData.week === workout.weekNumber
		) as WorkoutDataByWeek;

		workout.exercisesPerformed.forEach((exercise) => {
			musclesTargetedInWorkouts.add(exercise.muscleTarget);
			const muscleData = weekWorkoutData.allMuscleGroupData.find((muscleGroupData) => {
				return muscleGroupData.muscleGroup === exercise.muscleTarget;
			}) as MuscleGroupData;
			muscleData.volume += exercise.repsLoadRIR.length;
		});
		musclesTargetedInWorkouts.forEach((muscleTargeted) => {
			const muscleData = weekWorkoutData.allMuscleGroupData.find(
				(muscleGroupData) => muscleGroupData.muscleGroup === muscleTargeted
			) as MuscleGroupData;
			muscleData.freq++;
		});
	});
</script>

<div class="flex flex-col gap-3 h-px grow w-full">
	<div class="stats bg-primary w-full stats-vertical shrink-0">
		<div class="stat">
			<h2>Parent mesocycle</h2>
			<p class="text-xl font-bold text-white">{data.parentMesocycle.name}</p>
		</div>
		<div class="stat">
			<h2>Start date</h2>
			<p class="text-xl font-bold text-white">
				{dateFormatter(data.activeMesocycle.startDate)}
			</p>
		</div>
	</div>
	<div class="stats bg-primary w-full stats-vertical shrink-0">
		<div class="stat">
			<h2>Volume landmarks</h2>
			<div class="flex items-center gap-5">
				<input type="range" min={1} max={data.parentMesocycle.duration} bind:value={currentWeek} class="range range-sm" />
				<p class="bg-black px-2 py-1 rounded-md basis-24 text-center text-sm">Week {currentWeek}</p>
			</div>
		</div>
		<div class="stat flex flex-col w-full">
			{#each weeklyWorkoutData[currentWeek - 1].allMuscleGroupData as muscleGroupData}
				<MuscleGroupComponent {...muscleGroupData} />
			{/each}
		</div>
	</div>
	<div class="stats shrink-0 bg-primary w-full">
		<VolumeChart {weeklyWorkoutData} />
	</div>
	<div class="stats shrink-0 bg-primary w-full">
		<ExerciseChart workouts={performedMesoWorkouts} />
	</div>
	<div class="stats shrink-0 bg-primary w-full">
		<BestExercises workouts={performedMesoWorkouts} />
	</div>
</div>
