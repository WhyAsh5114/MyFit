<script lang="ts">
	import { navigating } from '$app/stores';

	export let data;

	let selectedMesocycle: undefined | number;
	function dateFormatter(timestamp: number | undefined) {
		if (!timestamp) return;
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	}

	let activeMesocycleWorkouts: Record<number, Workout> = {};
	$: {
		activeMesocycleWorkouts = {};
		if (data.activeMesocycle && data.activeMesocycle?.mesoID === selectedMesocycle) {
			data.activeMesocycle.workouts.forEach((workoutIndex) => {
				if (data.workouts && data.workouts[workoutIndex]) {
					activeMesocycleWorkouts[workoutIndex] = data.workouts[workoutIndex] as Workout;
				}
			});
		}
	}

	type PerformedMesocycleWorkouts = {
		startTimestamp: EpochTimeStamp;
		endTimestamp: EpochTimeStamp;
		workouts: Record<number, Workout>;
	};
	let performedMesocyclesWorkouts: PerformedMesocycleWorkouts[] = [];
	$: {
		performedMesocyclesWorkouts = [];
		if (data.performedMesocycles) {
			data.performedMesocycles.forEach((performedMeso) => {
				if (performedMeso.mesoID !== selectedMesocycle) return;
				let workouts: Record<number, Workout> = {};
				performedMeso.workouts.forEach((workoutIndex) => {
					if (data.workouts && data.workouts[workoutIndex]) {
						workouts[workoutIndex] = data.workouts[workoutIndex] as Workout;
					}
				});
				const mesoDataStructure: PerformedMesocycleWorkouts = {
					startTimestamp: performedMeso.startDate,
					endTimestamp: performedMeso.endDate,
					workouts
				};
				performedMesocyclesWorkouts.push(mesoDataStructure);
			});
			performedMesocyclesWorkouts = performedMesocyclesWorkouts.filter(
				(obj) => Object.keys(obj.workouts).length
			);
			performedMesocyclesWorkouts = performedMesocyclesWorkouts.sort((a, b) => {
				return b.startTimestamp - a.startTimestamp;
			});
		}
	}

	let filterByMesocycles = true;
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
	{#if filterByMesocycles}
		{#if Object.keys(activeMesocycleWorkouts).length > 0}
			<div class="flex flex-col gap-1">
				<h3 class="text-accent font-bold text-xl">
					Active ({dateFormatter(data.activeMesocycle?.startDate)})
				</h3>
				{#each Object.keys(activeMesocycleWorkouts).reverse() as workoutIndex}
					{#if data.workouts && data.workouts[parseInt(workoutIndex)]}
						<a
							class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
							href="/workouts/view/{workoutIndex}"
						>
							{#if data.mesocycles && data.workouts}
								<h3 class="font-semibold text-left w-full text-base text-secondary">
									{dateFormatter(data.workouts[parseInt(workoutIndex)]?.startTimestamp)}
								</h3>
								<h4 class="font-normal text-base">
									{data.mesocycles[activeMesocycleWorkouts[parseInt(workoutIndex)].mesoID]
										?.splitSchedule[activeMesocycleWorkouts[parseInt(workoutIndex)].dayNumber]}
								</h4>
							{/if}
						</a>
					{/if}
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
				{#each Object.keys(performedMesocycleWorkouts.workouts).reverse() as workoutIndex}
					<a
						class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
						href="/workouts/view/{workoutIndex}"
					>
						<h3 class="font-semibold text-left w-full text-base text-secondary">
							{dateFormatter(
								performedMesocycleWorkouts.workouts[parseInt(workoutIndex)].startTimestamp
							)}
						</h3>
						{#if data.mesocycles && data.workouts}
							<h4 class="font-normal text-base">
								{data.mesocycles[performedMesocycleWorkouts.workouts[parseInt(workoutIndex)].mesoID]
									?.splitSchedule[
									performedMesocycleWorkouts.workouts[parseInt(workoutIndex)].dayNumber
								]}
							</h4>
						{/if}
					</a>
				{/each}
			</div>
		{/each}
	{:else if data.workouts}
		{#each data.workouts.reverse() as workout, workoutIndex}
			{#if workout}
				<a
					class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
					href="/workouts/view/{workoutIndex}"
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
