<script lang="ts">
	import MesocycleCard from "./MesocycleCard.svelte";
	export let data;
</script>

<h2>Mesocycles</h2>
<p>Currently active (TODO)</p>
<p>All mesocycles</p>
{#each data.streamed.streamArray as mesocycleTemplatePromise}
	<MesocycleCard {mesocycleTemplatePromise} />
{/each}
<a href="/mesocycles/create" class="btn btn-block btn-accent mt-auto">Create new mesocycle</a>
