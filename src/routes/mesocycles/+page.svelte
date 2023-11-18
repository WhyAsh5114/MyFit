<script lang="ts">
	import MesocycleCard from "./MesocycleCard.svelte";
	export let data;
</script>

<h2>Mesocycles</h2>

<h3 class="text-xl mb-1">Currently active</h3>
<div class="skeleton w-full h-16 bg-primary brightness-50 rounded-md grid place-items-center">
	TODO
</div>

<h3 class="text-xl my-1">All mesocycles</h3>
<div class="flex flex-col gap-1.5 h-px grow overflow-y-auto">
	{#each data.streamed.streamArray as mesocycleTemplatePromise}
		<MesocycleCard {mesocycleTemplatePromise} />
	{/each}
</div>

<a href="/mesocycles/create" class="btn btn-block btn-accent mt-1">Create new mesocycle</a>
