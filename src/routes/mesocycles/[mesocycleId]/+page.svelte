<script lang="ts">
	import MesocycleBasicsTab from './(components)/MesocycleBasicsTab.svelte';
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { MesocycleWithExerciseSplit } from './+page.server';
	import MesocycleSkeleton from './(components)/MesocycleSkeleton.svelte';

	let { data } = $props();
	let mesocycle: MesocycleWithExerciseSplit | 'loading' = $state('loading');

	onMount(async () => {
		const serverMesocycle = await data.mesocycle;
		if (serverMesocycle) mesocycle = serverMesocycle;
		else toast.error('Exercise split not found');
	});
</script>

<H2>View mesocycle</H2>
{#if mesocycle === 'loading' || false}
	<MesocycleSkeleton />
{:else}
	<Tabs.Root value="basics" class="flex w-full grow flex-col">
		<Tabs.List class="grid">
			<Tabs.Trigger value="basics">Basics</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="basics">
			<MesocycleBasicsTab {mesocycle} />
		</Tabs.Content>
	</Tabs.Root>
{/if}
