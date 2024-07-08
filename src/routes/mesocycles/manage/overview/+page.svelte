<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import { trpc } from '$lib/trpc/client';
	import { invalidate, goto } from '$app/navigation';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import type { Prisma } from '@prisma/client';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import MesocycleCyclicSetChangesCharts from '../../(components)/MesocycleCyclicSetChangesCharts.svelte';
	import { TRPCClientError } from '@trpc/client';

	let { data } = $props();

	type SetChangeWithoutId = Prisma.MesocycleCyclicSetChangeCreateWithoutMesocycleInput;
	let savingMesocycle = $state(false);
	let startImmediately = $state(false);

	function getSplitWithoutExercises() {
		const exerciseSplit = mesocycleRunes.selectedExerciseSplit as FullExerciseSplit;
		const exerciseSplitWithoutExercises = {
			...exerciseSplit,
			exerciseSplitDays: exerciseSplit.exerciseSplitDays.map((splitDay) => {
				const { exercises, id, exerciseSplitId, ...rest } = splitDay;
				return rest;
			})
		};
		return exerciseSplitWithoutExercises;
	}

	async function createOrEditMesocycle() {
		savingMesocycle = true;
		const mesocycleCyclicSetChanges = mesocycleRunes.mesocycleCyclicSetChanges.map((setChange) => {
			const { startVolume, inSplit, ...rest } = setChange;
			return rest;
		});

		try {
			let response;
			if (mesocycleRunes.editingMesocycleId)
				response = await editMesocycle(
					mesocycleRunes.editingMesocycleId,
					mesocycleCyclicSetChanges
				);
			else response = await createMesocycle(mesocycleCyclicSetChanges);

			toast.success(response.message);
			await invalidate('mesocycles:all');
			await goto('/mesocycles');
			mesocycleRunes.resetStores();
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}

		savingMesocycle = false;
	}

	async function editMesocycle(id: string, mesocycleCyclicSetChanges: SetChangeWithoutId[]) {
		return await trpc().mesocycles.editById.mutate({
			id,
			mesocycleData: {
				mesocycle: mesocycleRunes.mesocycle,
				mesocycleCyclicSetChanges
			}
		});
	}

	async function createMesocycle(mesocycleCyclicSetChanges: SetChangeWithoutId[]) {
		const exerciseSplitWithoutExercises = getSplitWithoutExercises();
		return await trpc().mesocycles.create.mutate({
			mesocycle: {
				...mesocycleRunes.mesocycle,
				exerciseSplitId: exerciseSplitWithoutExercises.id
			},
			mesocycleCyclicSetChanges,
			mesocycleExerciseTemplates: mesocycleRunes.mesocycleExerciseTemplates,
			exerciseSplit: exerciseSplitWithoutExercises,
			startImmediately
		});
	}
</script>

<H3>Overview</H3>

{#if mesocycleRunes.editingMesocycleId === null}
	<Card.Root class="p-4">
		<div class="grid grid-cols-2">
			<div class="flex items-center">
				<Label for="start-mesocycle-immediately">Start immediately</Label>
			</div>
			{#await data.activeMesocycle}
				<Skeleton class="switch-skeleton" />
			{:then activeMesocycle}
				<Switch
					id="start-mesocycle-immediately"
					name="start-mesocycle-immediately"
					class="place-self-end"
					disabled={activeMesocycle !== null}
					bind:checked={startImmediately}
				/>
				{#if activeMesocycle !== null}
					<span class="col-span-2 text-sm text-muted-foreground">
						<b>{activeMesocycle.name}</b> is already active
					</span>
				{/if}
			{/await}
		</div>
	</Card.Root>
{/if}

<Card.Root class="my-2 p-4">
	<MesocycleCyclicSetChangesCharts cyclicSetChanges={mesocycleRunes.mesocycleCyclicSetChanges} />
</Card.Root>

<div class="mt-auto grid grid-cols-2 gap-1">
	<Button onclick={() => window.history.back()} variant="secondary">Previous</Button>
	<Button disabled={savingMesocycle} onclick={createOrEditMesocycle}>
		{#if savingMesocycle}
			<LoaderCircle class="animate-spin" />
		{:else}
			Save
		{/if}
	</Button>
</div>
