<script lang="ts">
	import { navigating } from '$app/stores';

	export let data;

	let selectedMesocycle: undefined | number;
	function dateFormatter(timestamp: number | undefined) {
		if (!timestamp) return;
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}

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
	$: if (filterByMesocycles) {
		console.log(data.workouts);
	} else {
		console.log(data.workouts);
	}
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<div class="flex justify-between">
		<h3 class="card-title">Current Mesocycle</h3>
		<input type="checkbox" class="toggle toggle-secondary" bind:checked={filterByMesocycles} />
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
			{:else if !filterByMesocycles}
				<option value={undefined}>Showing all workouts</option>
			{:else}
				{#if !data.activeMesocycle}
					<option selected disabled value={undefined}>No active mesocycle</option>
				{/if}
				{#each data.mesocycles as meso, i}
					{#if meso}
						{#if data.activeMesocycle?.mesoID === i}
							<option selected value={i}>{meso.name}</option>
						{:else}
							<option value={i}>{meso.name}</option>
						{/if}
					{/if}
				{/each}
			{/if}
		</select>
	</div>
</div>
<ul class="grow w-full my-2 flex flex-col gap-2">
	{#if filterByMesocycles && data.workouts}
		{#if activeMesocycleWorkouts.length > 0}
			<div class="flex flex-col gap-1">
				<h3 class="text-accent font-bold text-xl">
					Active ({dateFormatter(data.activeMesocycle?.startDate)})
				</h3>
				{#each activeMesocycleWorkouts as { id, workout }}
					<a
						class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
						href="/workouts/view/{id}"
					>
						<h3 class="font-semibold text-left w-full text-base text-secondary">
							{dateFormatter(workout.startTimestamp)}
						</h3>
						<h4 class="font-normal text-base">
							{#if data.mesocycles}
								{data.mesocycles[workout.mesoID]?.splitSchedule[workout.dayNumber]}
							{/if}
						</h4>
					</a>
				{/each}
			</div>
		{/if}
		{#each performedMesocyclesWorkouts as performedMesocycleWorkouts}
			<div class="flex flex-col gap-1">
				<h3 class="font-bold text-xl">
					{dateFormatter(performedMesocycleWorkouts.startTimestamp)} - {dateFormatter(
						performedMesocycleWorkouts.endTimestamp
					)}
				</h3>
				{#each performedMesocycleWorkouts.workouts as { id, workout }}
					<a
						class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
						href="/workouts/view/{id}"
					>
						<h3 class="font-semibold text-left w-full text-base text-secondary">
							{dateFormatter(workout.startTimestamp)}
						</h3>
						{#if data.mesocycles && data.workouts}
							<h4 class="font-normal text-base">
								{data.mesocycles[workout.mesoID]?.splitSchedule[workout.dayNumber]}
							</h4>
						{/if}
					</a>
				{/each}
			</div>
		{/each}
	{:else if data.workouts}
		{#each data.workouts.slice(0).reverse() as workout, workoutIndex}
			{#if workout}
				<a
					class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
					href="/workouts/view/{data.workouts.length - 1 - workoutIndex}"
				>
					<h3 class="font-semibold text-left w-full text-base text-secondary">
						{dateFormatter(workout.startTimestamp)}
					</h3>
					{#if data.mesocycles && data.workouts}
						<h4 class="font-normal text-base">
							{data.mesocycles[workout.mesoID]?.splitSchedule[workout.dayNumber]}
						</h4>
					{/if}
				</a>
			{/if}
		{/each}
	{/if}
</ul>
<a class="btn btn-block btn-accent" href="/workouts/new">
	{#if $navigating?.to?.url.pathname === '/workouts/new'}
		<span class="loading loading-spinner" />
	{/if}
	Log new workout
</a>
