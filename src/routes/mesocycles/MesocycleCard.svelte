<script lang="ts">
    export let mesocycleTemplatePromise: Promise<MesocycleTemplate | null>;
</script>

{#await mesocycleTemplatePromise}
	<div class="flex flex-col gap-4 w-52 bg-primary">
		<div class="skeleton h-32 w-full"></div>
		<div class="skeleton h-4 w-28"></div>
		<div class="skeleton h-4 w-full"></div>
		<div class="skeleton h-4 w-full"></div>
	</div>
{:then mesocycleTemplate}
	{#if mesocycleTemplate}
		<p>{mesocycleTemplate.name}</p>
	{/if}
{/await}
