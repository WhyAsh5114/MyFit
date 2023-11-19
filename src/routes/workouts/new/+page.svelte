<script lang="ts">
	import { getTodaysWorkout } from "$lib/util/MesocycleTemplate.js";

	export let data;
	const { activeMesocycle, activeMesocycleTemplate } = data;
	const { workout: todaysWorkout } = getTodaysWorkout(
		activeMesocycle.workouts,
		activeMesocycleTemplate.exerciseSplit
	);
</script>

<div class="stats stats-vertical">
	{#if todaysWorkout}
		<div class="stat">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">
				{todaysWorkout.name}
			</div>
			<div class="stat-desc"></div>
		</div>
		<div class="stat">
			<div class="stat-title">Muscle groups</div>
			<div class="stat-value"></div>
		</div>
	{:else}
		<div class="stat">
			<div class="stat-title">Workout template</div>
			<div class="stat-value">It's a Rest day!</div>
		</div>
	{/if}
</div>
