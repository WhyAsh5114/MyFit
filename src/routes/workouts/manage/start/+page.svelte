<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { onMount } from 'svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let activeMesocycle: { name: string } | null | 'loading' = $state('loading');
	let useActiveMesocycle = $state(false);

	let { data } = $props();
	onMount(async () => {
		activeMesocycle = await data.activeMesocycle;
		if (activeMesocycle) useActiveMesocycle = true;
	});
</script>

<H3>Start</H3>

{#if activeMesocycle === 'loading'}
	<Skeleton class="h-14 w-full rounded-md border border-opacity-0" />
{:else if activeMesocycle === null}
	<div class="flex items-center justify-between gap-2 rounded-md border bg-card p-4">
		<Label for="use-active-mesocycle" class="text-muted-foreground">No active mesocycle</Label>
		<Switch id="use-active-mesocycle" name="use-active-mesocycle" disabled />
	</div>
{:else}
	<div class="flex items-center justify-between gap-2 rounded-md border bg-card p-4">
		<Label for="use-active-mesocycle">Use active mesocycle</Label>
		<Switch
			id="use-active-mesocycle"
			name="use-active-mesocycle"
			bind:checked={useActiveMesocycle}
		/>
	</div>
{/if}

{#if activeMesocycle === 'loading'}
	TODO: skeleton
{:else if useActiveMesocycle}
	TODO: use active meso
{:else}
	TODO: don't use active meso
{/if}
