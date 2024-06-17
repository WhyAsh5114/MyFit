<script lang="ts">
	import MesocycleBasicsTab from './(components)/MesocycleBasicsTab.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { FullMesocycle } from './+page.server';
	import MesocycleSkeleton from './(components)/MesocycleSkeleton.svelte';
	import MesocycleSplitTab from './(components)/MesocycleSplitTab.svelte';
	import InfoPopover from '$lib/components/InfoPopover.svelte';

	let { data } = $props();
	let mesocycle: FullMesocycle | 'loading' = $state('loading');

	onMount(async () => {
		const serverMesocycle = await data.mesocycle;
		if (serverMesocycle) mesocycle = serverMesocycle;
		else toast.error('Mesocycle not found');
	});
</script>

<H2>View mesocycle</H2>
{#if mesocycle === 'loading'}
	<MesocycleSkeleton />
{:else}
	<Tabs.Root value="basics" class="flex w-full grow flex-col">
		<Tabs.List class="grid grid-cols-3">
			<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
			<Tabs.Trigger value="split" class="grid grid-cols-3">
				<span></span>
				<span>Split</span>
				<InfoPopover
					ariaLabel="mesocycle-split-info"
					text="The current exercise split for this mesocycle"
					triggerClasses="justify-self-end"
				/>
			</Tabs.Trigger>
			<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="basics">
			<MesocycleBasicsTab {mesocycle} />
		</Tabs.Content>
		<Tabs.Content value="split">
			<MesocycleSplitTab {mesocycle} />
		</Tabs.Content>
		<Tabs.Content value="stats">TODO</Tabs.Content>
	</Tabs.Root>
{/if}
