<script lang="ts">
	export let mesocycleTemplatePromise: Promise<MesocycleTemplate | null>;
</script>

{#await mesocycleTemplatePromise}
	<div class="skeleton w-full h-20 bg-primary brightness-50 rounded-md"></div>
{:then mesocycleTemplate}
	{#if mesocycleTemplate}
		<div class="bg-primary rounded-md w-full p-2 flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<span class="text-lg font-semibold">{mesocycleTemplate.name}</span>
				<span>{mesocycleTemplate.startRIR} RIR</span>
			</div>
			<div class="flex flex-wrap gap-1">
				{#each mesocycleTemplate.exerciseSplit as split}
					{#if split !== null}
						<span class="badge badge-accent font-semibold">{split.name}</span>
					{:else}
						<span class="badge"></span>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
{/await}
