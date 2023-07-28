<script lang="ts">
	import { dateFormatter, commonMuscleGroups } from '$lib/commonDB.js';
	import MuscleGroupComponent from '$lib/components/mesocycle/MuscleGroupComponent.svelte';

	export let data;
	let currentWeek = 1;

	let performedMesoWorkouts: (Workout | null)[] = [];
	data.activeMesocycle.workouts.forEach((workoutIndex) => {
		performedMesoWorkouts.push(data.workouts[workoutIndex]);
	});

	$: currentWeekWorkouts = performedMesoWorkouts.filter((workout) => workout?.weekNumber === currentWeek);

	type MuscleGroupData = { muscleGroup: (typeof commonMuscleGroups)[number]; volume: number; freq: number };
	let weekWorkoutData: MuscleGroupData[];
	$: {
		weekWorkoutData = [];
		commonMuscleGroups.forEach((muscleGroup) => {
			weekWorkoutData.push({ muscleGroup, volume: 0, freq: 0 });
		});
		currentWeekWorkouts.forEach((workout) => {
			const musclesTargetedInWorkouts: Set<(typeof commonMuscleGroups)[number]> = new Set();
			workout?.exercisesPerformed.forEach((exercise) => {
				musclesTargetedInWorkouts.add(exercise.muscleTarget);
				const muscleData = weekWorkoutData.find(
					(muscleGroupData) => muscleGroupData.muscleGroup === exercise.muscleTarget
				) as MuscleGroupData;
				muscleData.volume += exercise.repsLoadRIR.length;
			});
			musclesTargetedInWorkouts.forEach((muscleTargeted) => {
				const muscleData = weekWorkoutData.find(
					(muscleGroupData) => muscleGroupData.muscleGroup === muscleTargeted
				) as MuscleGroupData;
				muscleData.freq++;
			});
		});
	}
</script>

<div class="stats bg-primary w-full stats-vertical">
	<div class="stat">
		<h2>Parent mesocycle</h2>
		<p class="text-xl font-bold text-white">{data.parentMesocycle.name}</p>
	</div>
	<div class="stat">
		<h2>Duration</h2>
		<p class="text-xl font-bold text-white">
			{dateFormatter(data.activeMesocycle.startDate)}
		</p>
	</div>
</div>
<div class="stats bg-primary w-full mt-3 stats-vertical">
	<div class="stat flex items-center">
		<input type="range" min={1} max={data.parentMesocycle.duration} bind:value={currentWeek} class="range" />
		<p class="bg-black px-2 py-1 rounded-md basis-24 text-center text-sm">Week {currentWeek}</p>
	</div>
	<div class="stat flex flex-col w-full">
		{#each weekWorkoutData as muscleGroupData}
			<MuscleGroupComponent {...muscleGroupData} />
		{/each}
	</div>
</div>
