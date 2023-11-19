<script lang="ts">
	export let data;
	import TodaysWorkoutCard from "./TodaysWorkoutCard.svelte";
	import ActiveMesocycleCard from "./mesocycles/ActiveMesocycleCard.svelte";

	const { activeMesocycle, activeMesocycleTemplate } = data;
</script>

<h2>Home</h2>
{#if activeMesocycle && activeMesocycleTemplate}
	<h3 class="text-xl mb-1">Active mesocycle</h3>
	<ActiveMesocycleCard {activeMesocycle} {activeMesocycleTemplate} />

	<h3 class="text-xl mb-1 mt-2">Today's workout</h3>
	<TodaysWorkoutCard {activeMesocycle} {activeMesocycleTemplate} />
{/if}
