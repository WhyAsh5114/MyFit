<script lang="ts">
	import WorkoutCard from './WorkoutCard.svelte';
	import { navigating } from '$app/stores';
	import { dateFormatter } from '$lib/commonDB';

	export let data;
	let selectedMesocycle = data.activeMesocycle?.mesoID;

	let activeMesocycleWorkouts: { id: number; workout: Workout }[] = [];
	$: {
		activeMesocycleWorkouts = [];
		if (data.activeMesocycle && data.activeMesocycle?.mesoID === selectedMesocycle) {
			data.activeMesocycle.workouts.forEach((workoutIndex) => {
				if (data.workouts && data.workouts[workoutIndex]) {
					activeMesocycleWorkouts.push({
						id: workoutIndex,
						workout: data.workouts[workoutIndex] as Workout
					});
				}
			});
		}
		// Sort the workouts (latest first)
		activeMesocycleWorkouts.sort((a, b) => {
			return b.workout.startTimestamp - a.workout.startTimestamp;
		});
	}

	type PerformedMesocycleWorkouts = {
		startTimestamp: EpochTimeStamp;
		endTimestamp: EpochTimeStamp;
		workouts: { id: number; workout: Workout }[];
	};
	let performedMesocyclesWorkouts: PerformedMesocycleWorkouts[] = [];
	$: {
		performedMesocyclesWorkouts = [];
		if (data.performedMesocycles) {
			data.performedMesocycles.forEach((performedMeso) => {
				if (performedMeso.mesoID !== selectedMesocycle) return;
				let workouts: { id: number; workout: Workout }[] = [];
				performedMeso.workouts.forEach((workoutIndex) => {
					if (data.workouts && data.workouts[workoutIndex]) {
						workouts.push({
							id: workoutIndex,
							workout: data.workouts[workoutIndex] as Workout
						});
					}
				});
				const mesoDataStructure: PerformedMesocycleWorkouts = {
					startTimestamp: performedMeso.startDate,
					endTimestamp: performedMeso.endDate,
					workouts
				};
				performedMesocyclesWorkouts.push(mesoDataStructure);
			});
			// Only keep mesos with at least 1 workout
			performedMesocyclesWorkouts = performedMesocyclesWorkouts.filter(
				(obj) => obj.workouts.length
			);
			// Sort the mesocycles by date (latest first)
			performedMesocyclesWorkouts = performedMesocyclesWorkouts.sort((a, b) => {
				return b.startTimestamp - a.startTimestamp;
			});
			// Sort the workouts of each meso by date (latest first)
			performedMesocyclesWorkouts.forEach((mesoWorkouts) => {
				mesoWorkouts.workouts.sort((a, b) => {
					return b.workout.startTimestamp - a.workout.startTimestamp;
				});
			});
		}
	}

	let filterByMesocycles = true;
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<div class="flex justify-between">
		<h3 class="card-title">Current Mesocycle</h3>
		<input
			type="checkbox"
			class="toggle toggle-secondary"
			aria-label="filter-by-mesocycle"
			bind:checked={filterByMesocycles}
		/>
	</div>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<div class="flex gap-2">
		<select
			class="select select-sm select-bordered grow"
			bind:value={selectedMesocycle}
			disabled={!filterByMesocycles}
		>
			{#if data.mesocycles === null || data.mesocycles.length === 0}
				<option value={undefined}>No mesocycle created</option>
			{:else if !data.activeMesocycle}
				<option disabled value={undefined}>No active mesocycle</option>
			{:else}
				{#each data.mesocycles as meso, i}
					{#if meso}
						<option value={i}>{meso.name}</option>
					{/if}
				{/each}
			{/if}
		</select>
	</div>
</div>
<div class="grow w-full my-2 flex flex-col gap-2">
	{#if filterByMesocycles && data.workouts}
		{#if activeMesocycleWorkouts.length > 0}
			<div class="flex flex-col gap-1">
				<h3 class="text-accent font-bold text-xl">
					Active ({dateFormatter(data.activeMesocycle?.startDate)})
				</h3>
				<ul class="flex flex-col gap-1">
					{#each activeMesocycleWorkouts as { id, workout }}
						<WorkoutCard {workout} workoutIndex={id} mesocycles={data.mesocycles} />
					{/each}
				</ul>
			</div>
		{/if}
		{#each performedMesocyclesWorkouts as performedMesocycleWorkouts}
			<div class="flex flex-col gap-1">
				<h3 class="font-bold text-xl">
					{dateFormatter(performedMesocycleWorkouts.startTimestamp)} - {dateFormatter(
						performedMesocycleWorkouts.endTimestamp
					)}
				</h3>
				<ul class="flex flex-col gap-1">
					{#each performedMesocycleWorkouts.workouts as { id, workout }}
						<WorkoutCard {workout} workoutIndex={id} mesocycles={data.mesocycles} />
					{/each}
				</ul>
			</div>
		{/each}
	{:else if data.workouts}
		<ul class="flex flex-col gap-1">
			{#each data.workouts.slice(0).reverse() as workout, workoutIndex}
				{#if workout}
					<WorkoutCard
						{workout}
						workoutIndex={data.workouts.length - workoutIndex}
						mesocycles={data.mesocycles}
					/>
				{/if}
			{/each}
		</ul>
	{/if}
</div>
<a class="btn btn-block btn-accent" href="/workouts/new">
	{#if $navigating?.to?.url.pathname === '/workouts/new'}
		<span class="loading loading-spinner" />
	{/if}
	Log new workout
</a>
