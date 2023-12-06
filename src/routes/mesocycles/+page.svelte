<script lang="ts">
	export let data;
	import { getTotalDuration } from "$lib/util/MesocycleTemplate";
	import ActiveMesocycleCard from "./ActiveMesocycleCard.svelte";
	import MesocycleTemplateCard from "./MesocycleTemplateCard.svelte";

	let totalMesocycleTemplates = data.streamed.mesocycleTemplatesStreamArray.length;
	const { activeMesocycle, activeMesocycleTemplate } = data;

	let totalCycles: number, totalWorkouts: number;
	if (activeMesocycleTemplate) {
		const totalNonRestDays = activeMesocycleTemplate.exerciseSplit.filter(
			(split) => split !== null
		).length;
		totalCycles = getTotalDuration(activeMesocycleTemplate.RIRProgression);
		totalWorkouts = totalCycles * totalNonRestDays;
	}
</script>

<h2>Mesocycles</h2>

<h3 class="text-xl mb-1">Currently active</h3>
{#if activeMesocycle && activeMesocycleTemplate}
	<ActiveMesocycleCard {activeMesocycleTemplate} {activeMesocycle} />
{:else}
	<div class="flex flex-col bg-primary rounded-md p-2">
		<span class="text-warning">No mesocycle active</span>
		Start one by selecting it from the menu below and hitting start
	</div>
{/if}

<h3 class="text-xl mb-1 mt-3">Mesocycle templates</h3>
<div class="flex flex-col gap-1.5 h-px grow overflow-y-auto">
	{#if totalMesocycleTemplates > 0}
		{#each data.streamed.mesocycleTemplatesStreamArray as mesocycleTemplatePromise}
			<MesocycleTemplateCard {mesocycleTemplatePromise} />
		{/each}
	{:else}
		<div class="flex flex-col bg-primary rounded-md p-2">
			<span class="text-warning">No mesocycle created</span>
			Create one by clicking the button below
		</div>
	{/if}
</div>

<a href="/mesocycles/create" class="btn btn-block btn-accent mt-1">Create new mesocycle</a>
