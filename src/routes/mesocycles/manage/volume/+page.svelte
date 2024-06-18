<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import MesocycleStartVolumesSetupTable from './(components)/MesocycleStartVolumesSetupTable.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { goto, invalidate } from '$app/navigation';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import { trpc } from '$lib/trpc/client';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');
	let savingMesocycle = $state(false);

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (!serverExerciseSplit) {
			toast.error('Exercise split not found');
			return;
		} else if (mesocycleRunes.selectedExerciseSplit?.id !== serverExerciseSplit.id) {
			mesocycleRunes.selectedExerciseSplit = serverExerciseSplit;
		}
		exerciseSplit = serverExerciseSplit;
	});

	async function createOrEditMesocycle() {
		const id = mesocycleRunes.editingMesocycleId;
		savingMesocycle = true;

		mesocycleRunes.distributeStartVolumes();
		const exerciseSplit = mesocycleRunes.selectedExerciseSplit as FullExerciseSplit;
		const exerciseSplitWithoutExercises = {
			...exerciseSplit,
			exerciseSplitDays: exerciseSplit.exerciseSplitDays.map((splitDay) => {
				const { exercises, id, exerciseSplitId, ...rest } = splitDay;
				return rest;
			})
		};
		const mesocycleCyclicSetChanges = mesocycleRunes.mesocycleCyclicSetChanges.map((setChange) => {
			const { startVolume, inSplit, ...rest } = setChange;
			return rest;
		});

		if (id) {
		} else {
			const { message } = await trpc().mesocycles.create.mutate({
				mesocycle: {
					...mesocycleRunes.mesocycle,
					exerciseSplitId: exerciseSplitWithoutExercises.id
				},
				mesocycleCyclicSetChanges,
				mesocycleExerciseTemplates: mesocycleRunes.mesocycleExerciseTemplates,
				exerciseSplit: exerciseSplitWithoutExercises
			});
			await invalidate('mesocycles:all');
			toast.success(message);
			mesocycleRunes.resetStores();
		}
		await goto('/mesocycles');
		savingMesocycle = false;
	}
</script>

<H3>Volume</H3>
{#if exerciseSplit !== 'loading'}
	<ScrollArea orientation="both" class="h-px grow">
		<MesocycleStartVolumesSetupTable />
	</ScrollArea>
	<div class="grid grid-cols-2 gap-1">
		<Button variant="secondary" href="./exercise-split">Previous</Button>
		<Button disabled={savingMesocycle} onclick={createOrEditMesocycle}>
			{#if savingMesocycle}
				<LoaderCircle class="animate-spin" />
			{:else}
				Save
			{/if}
		</Button>
	</div>
{:else}
	<div class="flex h-full w-full items-center justify-center text-muted-foreground">
		Fetching exercises
		<LoaderCircle class="ml-2 animate-spin" />
	</div>
{/if}
