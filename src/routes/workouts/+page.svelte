<script lang="ts">
	import { navigating } from '$app/stores';

	export let data;

	let selectedMesocycle: undefined | number;
	function dateFormatter(timestamp: number | undefined) {
		if (!timestamp) return;
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
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
	{#if data.activeMesocycle && data.activeMesocycle.workouts.length > 0 && data.activeMesocycle.mesoID === selectedMesocycle}
		<div class="flex flex-col gap-1">
			<h3 class="text-accent font-bold text-xl">
				Active ({dateFormatter(data.activeMesocycle?.startDate)})
			</h3>
			{#each data.activeMesocycle.workouts.reverse() as workoutIndex}
				{#if data.workouts && data.workouts[workoutIndex]}
					<a
						class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
						href="/workouts/view/{workoutIndex}"
					>
						{#if data.mesocycles && data.workouts}
							<h3 class="font-semibold text-left w-full text-base text-secondary">
								{dateFormatter(data.workouts[workoutIndex || 0]?.startTimestamp)}
							</h3>
							<h4 class="font-normal text-base">
								{data.mesocycles[data.workouts[workoutIndex]?.mesoID || 0]?.splitSchedule[
									data.workouts[workoutIndex]?.dayNumber || 0
								]}
							</h4>
						{/if}
					</a>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Older sections (with dates) -->
	<!-- TODO: loop over data.performedMesocycles and if performedMesocycle.mesoID == selectedMesocycle -->
	<!-- TODO: show section with heading of date range (startDate - endDate) -->
	<!-- TODO: loop over the performedMesocycle.workouts and show them as cards -->
	{#if data.performedMesocycles && data.workouts}
		{#each data.performedMesocycles as performedMesocycle}
			{#if performedMesocycle.mesoID === selectedMesocycle}
				<div class="flex flex-col gap-1">
					<h3 class="font-bold text-xl">
						{dateFormatter(performedMesocycle.startDate)} - {dateFormatter(
							performedMesocycle.endDate
						)}
					</h3>
					{#each performedMesocycle.workouts.reverse() as workoutIndex}
						<a
							class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
							href="/workouts/view/{workoutIndex}"
						>
							<h3 class="font-semibold text-left w-full text-base text-secondary">
								{dateFormatter(data.workouts[workoutIndex]?.startTimestamp)}
							</h3>
							{#if data.mesocycles && data.workouts}
								<h4 class="font-normal text-base">
									{data.mesocycles[data.workouts[workoutIndex]?.mesoID || 0]?.splitSchedule[
										data.workouts[workoutIndex]?.dayNumber || 0
									]}
								</h4>
							{/if}
						</a>
					{/each}
				</div>
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
