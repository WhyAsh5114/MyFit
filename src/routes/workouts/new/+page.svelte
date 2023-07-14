<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { days } from '$lib/commonDB';
	import { workoutDay, plannedRIR, muscleTargetsAndSets, weekNumber } from './newWorkoutStore.js';
	export let data;

	let date = new Date();
	let todaysDay = days[date.getDay()];
	$workoutDay = date.getDay();

	$weekNumber = Math.ceil((+date - data.activeMesocycle.startDate) / (1000 * 60 * 60 * 24 * 7));
	$plannedRIR =
		data.parentMesocycle.startRIR -
		Math.floor(($weekNumber * data.parentMesocycle.startRIR) / data.parentMesocycle.duration);

	$: workoutExercises = data.parentMesocycle.splitExercises[$workoutDay];
	$: {
		$muscleTargetsAndSets = {};
		workoutExercises.forEach((exercise) => {
			if ($muscleTargetsAndSets[exercise.muscleTarget]) {
				$muscleTargetsAndSets[exercise.muscleTarget] += exercise.sets as number;
			} else {
				$muscleTargetsAndSets[exercise.muscleTarget] = exercise.sets as number;
			}
		});
	}
</script>

<form
	class="flex flex-col w-full gap-2 h-full"
	on:submit|preventDefault={() => {
		goto('/workouts/new/exercises');
	}}
>
	<div class="stats bg-primary shrink-0 w-full">
		<div class="stat">
			<div class="flex justify-between">
				<div class="opacity-90">Current mesocycle</div>
			</div>
			<div class="text-2xl font-bold text-white">{data.parentMesocycle.name}</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0 w-full">
		<div class="stat">
			<div class="flex justify-between">
				<div class="opacity-90">Workout template</div>
			</div>
			<div class="flex w-full items-center justify-between mt-1.5 gap-4">
				<p class="text-xl font-bold text-white">{todaysDay}</p>
				<select class="select select-sm select-bordered grow" bind:value={$workoutDay} required>
					{#each data.parentMesocycle.splitSchedule as workoutName, i}
						{#if workoutName}
							<option value={i}>{workoutName}</option>
						{:else}
							<option value="" disabled class="opacity-50">Rest</option>
						{/if}
					{/each}
				</select>
			</div>
		</div>
	</div>
	<div class="stats bg-primary shrink-0 w-full">
		<div class="stat">
			<div class="flex justify-between">
				<div class="opacity-90">Planned RIR</div>
			</div>
			<select class="select select-sm select-bordered mt-1.5" bind:value={$plannedRIR}>
				<option value={4}>4 RIR</option>
				<option value={3}>3 RIR</option>
				<option value={2}>2 RIR</option>
				<option value={1}>1 RIR</option>
				<option value={0}>0 RIR</option>
			</select>
		</div>
	</div>
	<div class="stats bg-primary shrink-0 w-full">
		<div class="stat">
			<div class="flex justify-between">
				<div class="opacity-90">Muscle targets</div>
			</div>
			<div class="flex flex-wrap mt-2 gap-1">
				{#each Object.keys($muscleTargetsAndSets) as muscleTarget}
					<span class="badge text-white">{muscleTarget} x {$muscleTargetsAndSets[muscleTarget]}</span>
				{/each}
			</div>
		</div>
	</div>
	<button class="btn btn-block btn-accent mt-auto">
		{#if $navigating?.to?.url.pathname === '/workouts/new/exercises'}
			<span class="loading loading-spinner" />
		{/if}
		Start logging
	</button>
</form>
