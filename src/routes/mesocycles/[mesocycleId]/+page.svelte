<script lang="ts">
	import MesocycleBasicsTab from './(components)/MesocycleBasicsTab.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { FullMesocycle } from './+layout.server';
	import MesocycleSkeleton from './(components)/MesocycleSkeleton.svelte';
	import MesocycleSplitTab from './(components)/MesocycleSplitTab.svelte';
	import MesocycleVolumeTab from './(components)/MesocycleVolumeTab.svelte';
	import MesocycleCharts from '../(components)/MesocycleCharts.svelte';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props();
	let mesocycle: FullMesocycle | 'loading' = $state('loading');
	let selectedTabValue = $state('basics');
	let chartMode = $state(false);

	onMount(async () => {
		const serverMesocycle = await data.mesocycle;
		if (serverMesocycle) mesocycle = serverMesocycle;
		else toast.error('Mesocycle not found');
	});
</script>

<H2 showChartIcon={selectedTabValue !== 'basics'} bind:chartMode>View mesocycle</H2>

{#if mesocycle === 'loading'}
	<MesocycleSkeleton />
{:else}
	<Tabs.Root bind:value={selectedTabValue} class="flex w-full grow flex-col">
		<Tabs.List class="grid grid-cols-4">
			<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
			<Tabs.Trigger value="split">Split</Tabs.Trigger>
			<Tabs.Trigger value="volume">Volume</Tabs.Trigger>
			<Tabs.Trigger value="workouts">Workouts</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="basics">
			<MesocycleBasicsTab {mesocycle} />
		</Tabs.Content>
		<Tabs.Content value="split">
			{#if !chartMode}
				<MesocycleSplitTab {mesocycle} />
			{:else}
				TODO: show basic split stats like volume distribution across the microcycle, across muscle
				groups
			{/if}
		</Tabs.Content>
		<Tabs.Content value="volume" class="grow">
			{#if !chartMode}
				<div class="flex h-full flex-col">
					<MesocycleVolumeTab cyclicSetChanges={mesocycle.mesocycleCyclicSetChanges} />
				</div>
			{:else}
				<Card.Root class="p-4">
					<MesocycleCharts cyclicSetChanges={mesocycle.mesocycleCyclicSetChanges} />
				</Card.Root>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="workouts" class="grow">
			{#if !chartMode}
				TODO: workouts list and some stats like: most progressed muscle group, exercise, least
				progressed, highest volumes, etc
			{:else}
				TODO: charts that show progression
			{/if}
		</Tabs.Content>
	</Tabs.Root>
{/if}
