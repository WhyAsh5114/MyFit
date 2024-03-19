<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import H3 from '$lib/components/ui/typography/H3.svelte';
</script>

<H2>New exercise split</H2>
<H3>Starting from scratch</H3>

{#if true}
	<Button class="mt-auto">Create new split</Button>
{:else}
	<div class="grid grid-cols-2 gap-2 mt-auto">
		<Button variant="destructive">Overwrite changes</Button>
		<Button>Continue editing</Button>
	</div>
{/if}
