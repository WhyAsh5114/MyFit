<script lang="ts">
	import { dateFormatter } from "$lib/util/CommonFunctions";
	import { getMuscleGroupsAndSets } from "$lib/util/MesocycleTemplate";

	export let workoutPromise: Promise<
		(Workout & { id: string } & { performedMesocycleId: string }) | null
	>;
</script>

{#await workoutPromise}
	<div class="skeleton w-full h-20 bg-primary brightness-50 rounded-md"></div>
{:then workout}
	{#if workout}
		<button class="btn btn-primary rounded-md justify-start px-0 font-normal h-fit">
			<div class="flex flex-col p-2 w-full items-start">
				<span class="text-lg font-semibold">{dateFormatter(workout.startTimestamp)}</span>
				<div class="flex flex-wrap gap-1 mt-2">
					{#each getMuscleGroupsAndSets(workout.exercisesPerformed) as { muscleGroup, sets }}
						<span class="badge font-semibold">{muscleGroup} x {sets}</span>
					{/each}
				</div>
			</div>
		</button>
	{/if}
{/await}
