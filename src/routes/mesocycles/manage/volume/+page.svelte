<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import MesocycleStartVolumesSetupTable from './(components)/MesocycleStartVolumesSetupTable.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');

	onMount(async () => {
		if (data.editing) return;
		const serverExerciseSplit = await data.exerciseSplit;
		if (!serverExerciseSplit) {
			toast.error('Exercise split not found');
			return;
		} else if (mesocycleRunes.selectedExerciseSplit?.id !== serverExerciseSplit.id) {
			mesocycleRunes.selectedExerciseSplit = serverExerciseSplit;
		}
		exerciseSplit = serverExerciseSplit;
	});

	function submitVolume() {
		mesocycleRunes.distributeStartVolumes();
		goto('./overview');
	}
</script>

<H3>Volume</H3>
{#if exerciseSplit !== 'loading' || data.editing}
	<ScrollArea class="h-px grow" orientation="both">
		<MesocycleStartVolumesSetupTable />
	</ScrollArea>
	<div class="grid grid-cols-2 gap-1">
		<Button href="./progression" variant="secondary">Previous</Button>
		<Button onclick={submitVolume}>Next</Button>
	</div>
{:else}
	<div class="flex h-full w-full items-center justify-center text-muted-foreground">
		Fetching exercises
		<LoaderCircle class="ml-2 animate-spin" />
	</div>
{/if}
