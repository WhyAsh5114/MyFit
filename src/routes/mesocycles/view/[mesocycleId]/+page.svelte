<script lang="ts">
	import { dateFormatter } from "$lib/util/CommonFunctions.js";
	export let data;
</script>

<div class="stats stats-vertical">
	<div class="stat">
		<div class="stat-title">Mesocycle template</div>
		<a
			class="stat-value link truncate"
			href="/mesocycles/viewTemplate/{data.mesocycleTemplate?.id}"
		>
			{data.mesocycleTemplate?.name}
		</a>
	</div>
	<div class="stat">
		<div class="stat-title">Started at</div>
		<div class="stat-value">{dateFormatter(data.mesocycle.startTimestamp)}</div>
	</div>
	<div class="stat">
		<div class="stat-title">Workouts</div>
		<div class="flex flex-col max-h-32 overflow-y-auto mt-2 gap-1">
			{#each data.streamed.workoutsStreamArray as workoutPromise}
				{#await workoutPromise}
					<div class="skeleton h-8 w-full bg-primary brightness-50 rounded-md"></div>
				{:then workout}
					{#if workout}
						<a class="btn h-8 btn-sm" href="/workouts/view/{workout.id}">
							<div class="flex w-full justify-between items-center">
								<span>{dateFormatter(workout.startTimestamp)}</span>
								<span class="font-normal text-sm">
									{data.mesocycleTemplate?.exerciseSplit[workout.dayNumber]?.name}, Cycle {workout.cycleNumber}
								</span>
							</div>
						</a>
					{/if}
				{/await}
			{/each}
		</div>
	</div>
</div>
