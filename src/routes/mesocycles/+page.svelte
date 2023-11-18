<script lang="ts">
	import { calculateTotalDuration } from "$lib/commonDB";
	import MesocycleCard from "./MesocycleCard.svelte";
	export let data;

	let totalMesocycleTemplates = data.streamed.mesocycleTemplatesStreamArray.length;

	let totalCycles: number, totalWorkouts: number;
	if (data.activeMesocycleTemplate) {
		const totalNonRestDays = data.activeMesocycleTemplate.exerciseSplit.filter(
			(split) => split !== null
		).length;
		totalCycles = calculateTotalDuration(data.activeMesocycleTemplate.RIRProgression);
		totalWorkouts = totalCycles * totalNonRestDays;
	}
</script>

<h2>Mesocycles</h2>

<h3 class="text-xl mb-1">Currently active</h3>
{#if data.activeMesocycleTemplate}
	<button class="btn btn-primary rounded-md h-fit p-2">
		<div class="grid grid-cols-3 place-items-center w-full gap-2">
			<span class="font-semibold text-lg text-accent text-left col-span-2"
				>{data.activeMesocycleTemplate.name}</span
			>
			<span class="row-span-2 font-normal">
				{data.activeMesocycle.workouts.length}/{totalWorkouts} workouts completed
			</span>
			<progress
				class="progress progress-accent col-span-2"
				value={data.activeMesocycle.workouts.length}
				max={totalWorkouts}
			></progress>
			
		</div>
	</button>
{:else}
	<div class="flex flex-col bg-primary rounded-md p-2">
		<span class="text-warning">No mesocycle active</span>
		Start one by selecting it from the menu below and hitting start
	</div>
{/if}

<h3 class="text-xl mb-1 mt-3">All mesocycles</h3>
<div class="flex flex-col gap-1.5 h-px grow overflow-y-auto">
	{#if totalMesocycleTemplates > 0}
		{#each data.streamed.mesocycleTemplatesStreamArray as mesocycleTemplatePromise}
			<MesocycleCard {mesocycleTemplatePromise} />
		{/each}
	{:else}
		<div class="flex flex-col bg-primary rounded-md p-2">
			<span class="text-warning">No mesocycle created</span>
			Create one by clicking the button below
		</div>
	{/if}
</div>

<a href="/mesocycles/create" class="btn btn-block btn-accent mt-1">Create new mesocycle</a>
