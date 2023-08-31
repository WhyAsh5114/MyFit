<script lang="ts">
	import { navigating } from '$app/stores';
	import { dateFormatter } from '$lib/commonDB';

	export let workout: Workout;
	export let workoutIndex: number;
	export let mesocycles: (Mesocycle | null)[] | null;
</script>

<li>
	<a
		class="btn relative flex-col btn-primary normal-case rounded-lg w-full p-2 flex-nowrap h-fit gap-1 items-start"
		href="/workouts/view/{workoutIndex}"
	>
		{#if $navigating?.to?.url.pathname === `/workouts/view/${workoutIndex}`}
			<div class="absolute h-full w-full bg-black bg-opacity-75 grid place-items-center rounded-lg left-0 right-0">
				<span class="loading loading-spinner loading-lg" />
			</div>
		{/if}
		<h3 class="font-semibold text-left w-full text-base text-secondary">
			{dateFormatter(workout.startTimestamp)}
		</h3>
		{#if mesocycles}
			<h4 class="font-normal text-base">
				{mesocycles[workout.mesoID]?.splitSchedule[workout.dayNumber]}
			</h4>
		{/if}
	</a>
</li>
