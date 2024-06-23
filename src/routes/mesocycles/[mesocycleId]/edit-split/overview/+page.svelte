<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

  function saveMesocycleExerciseSplit() {}
</script>

<H3>Overview</H3>
<div class="mt-2 grid grid-cols-2 gap-1">
	<Button variant="secondary" href="./structure">Previous</Button>
	<Button onclick={saveMesocycleExerciseSplit}>Save</Button>
</div>
