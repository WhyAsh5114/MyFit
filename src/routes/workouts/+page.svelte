<script lang="ts">
	import { navigating } from '$app/stores';

	export let data;

	let selectedMesocycle: undefined | number;
	let workoutsOfActiveMesocycleWithIndex: [Workout, number][] = [];

	$: {
		workoutsOfActiveMesocycleWithIndex = [];
		if (selectedMesocycle && selectedMesocycle === data.activeMesocycle?.mesoID) {
			data.activeMesocycle.workouts.forEach((workoutIndex) => {
				if (data.workouts) {
					workoutsOfActiveMesocycleWithIndex.push([data.workouts[workoutIndex], workoutIndex]);
				}
			});
		}
		workoutsOfActiveMesocycleWithIndex = workoutsOfActiveMesocycleWithIndex;
	}
</script>

<div class="flex flex-col bg-primary p-5 rounded-lg w-full">
	<h3 class="card-title">Current Mesocycle</h3>
	<div class="h-0.5 bg-black mt-1 mb-4" />
	<div class="flex gap-2">
		<select class="select select-sm select-bordered grow" bind:value={selectedMesocycle}>
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
	{#if workoutsOfActiveMesocycleWithIndex.length > 0 && data.activeMesocycle}
		<h3 class="text-accent font-bold text-xl">
			Active ({new Date(data.activeMesocycle?.startDate).toLocaleDateString()})
		</h3>
		{#each workoutsOfActiveMesocycleWithIndex as workout}
			<a
				class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
				href="/workouts/view/{workout[1]}"
			>
				<h3 class="font-semibold text-left w-full text-base">
					{new Date(workout[0].startTimestamp).toLocaleString()}
				</h3>
				{#if data.mesocycles && data.workouts}
					<h4 class="font-normal text-base">
						{data.mesocycles[workout[0].mesoID]?.splitSchedule[workout[0].dayNumber]}
					</h4>
				{/if}
			</a>
		{/each}
	{/if}

	<!-- Older sections (with dates) -->
	<!-- TODO: loop over data.performedMesocycles and if performedMesocycle.mesoID == selectedMesocycle -->
	<!-- TODO: show section with heading of date range (startDate - endDate) -->
	<!-- TODO: loop over the performedMesocycle.workouts and show them as cards -->
	{#if data.performedMesocycles}
		{#each data.performedMesocycles as performedMesocycle}
			{#if performedMesocycle.mesoID === selectedMesocycle}
				<h3 class="text-accent font-bold text-xl">
					{new Date(performedMesocycle.startDate).toLocaleDateString()} - {new Date(
						performedMesocycle.endDate
					).toLocaleDateString()}
				</h3>
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
