<script lang="ts">
	export let mesocycleTemplatePromise: Promise<WithSerializedID<MesocycleTemplate> | null>;

	function calculateDuration(progression: RIRProgressionData[]) {
		let totalDuration = 0;
		progression.forEach(({ cycles }) => {
			totalDuration += cycles;
		});
		return totalDuration;
	}
</script>

{#await mesocycleTemplatePromise}
	<div class="skeleton w-full h-20 bg-primary brightness-50 rounded-md"></div>
{:then mesocycleTemplate}
	{#if mesocycleTemplate}
		<a
			class="btn btn-primary h-fit p-2 flex-col rounded-md"
			href="/mesocycles/view/{mesocycleTemplate.id}"
		>
			<div class="flex flex-col w-full gap-1">
				<div class="flex items-center justify-between">
					<span class="text-lg font-semibold">{mesocycleTemplate.name}</span>
					<span class="font-normal"
						>{calculateDuration(mesocycleTemplate.RIRProgression)} cycles</span
					>
				</div>
				<div class="flex flex-wrap gap-1">
					{#each mesocycleTemplate.exerciseSplit as split}
						{#if split !== null}
							<span class="badge font-semibold">{split.name}</span>
						{:else}
							<span class="badge"></span>
						{/if}
					{/each}
				</div>
			</div>
		</a>
	{/if}
{/await}
