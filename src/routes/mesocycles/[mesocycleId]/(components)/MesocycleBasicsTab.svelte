<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';

	import CloneIcon from 'virtual:icons/clarity/clone-line';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import ExtractIcon from 'virtual:icons/lucide/pickaxe';

	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { arraySum } from '$lib/utils';
	import { trpc } from '$lib/trpc/client';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import { mesocycleRunes, type FullMesocycleWithoutIds } from '../../manage/mesocycleRunes.svelte';
	import { TRPCClientError } from '@trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	let { mesocycle }: { mesocycle: NonNullable<RouterOutputs['mesocycles']['findById']> } = $props();
	let deleteConfirmDrawerOpen = $state(false);
	let extractSplitConfirmDrawerOpen = $state(false);
	let extractedExerciseSplitName = $state('');
	let callingDeleteEndpoint = $state(false);
	let callingPatchEndpoint = $state(false);
	let callingCreateExerciseSplitEndpoint = $state(false);

	function loadMesocycle(mode: 'edit' | 'clone') {
		if (mode === 'edit') {
			mesocycleRunes.loadMesocycle(getMesocycleWithoutIds(), mesocycle.id);
		} else if (mode === 'clone') {
			mesocycleRunes.loadMesocycle({ ...getMesocycleWithoutIds(), startDate: null, endDate: null });
		}
		goto(`/mesocycles/manage/basics`);
	}

	function getMesocycleWithoutIds() {
		const { exerciseSplit, mesocycleCyclicSetChanges, mesocycleExerciseSplitDays, ...mesocycleData } = mesocycle;

		const { id, userId, exerciseSplitId, workoutsOfMesocycle, ...mesocycleDataWithoutIds } = mesocycleData;
		const mesocycleWithoutIds: FullMesocycleWithoutIds = {
			...mesocycleDataWithoutIds,
			mesocycleCyclicSetChanges: mesocycleCyclicSetChanges.map((setChange) => {
				const { id, mesocycleId, ...rest } = setChange;
				return rest;
			}),
			mesocycleExerciseSplitDays: mesocycleExerciseSplitDays.map((splitDay) => {
				const { id, mesocycleSplitDayExercises: exercisesWithId, ...rest } = splitDay;
				const mesocycleSplitDayExercises = exercisesWithId.map((exercise) => {
					const { id, ...rest } = exercise;
					return rest;
				});
				return { mesocycleSplitDayExercises, ...rest };
			})
		};
		return mesocycleWithoutIds;
	}

	async function progressMesocycle() {
		callingPatchEndpoint = true;
		try {
			const response = await trpc().mesocycles.progressToNextStage.mutate({
				id: mesocycle.id,
				startDate: mesocycle.startDate,
				endDate: mesocycle.endDate
			});
			mesocycle.startDate = response.startDate;
			mesocycle.endDate = response.endDate;
			await invalidate('mesocycles:active');
			toast.success(response.message);
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		callingPatchEndpoint = false;
	}

	async function deleteMesocycle() {
		callingDeleteEndpoint = true;
		try {
			const { message } = await trpc().mesocycles.deleteById.mutate(mesocycle.id);
			toast.success(message);
			await invalidate('mesocycles:all');
			await goto('/mesocycles');
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		callingDeleteEndpoint = false;
	}

	function convertMesocycleSplitDayExerciseToExerciseSplitDayExercise(
		exercise: NonNullable<
			RouterOutputs['mesocycles']['findById']
		>['mesocycleExerciseSplitDays'][number]['mesocycleSplitDayExercises'][number]
	) {
		const {
			sets,
			mesocycleExerciseSplitDayId,
			overloadPercentage,
			lastSetToFailure,
			forceRIRMatching,
			minimumWeightChange,
			...rest
		} = exercise;
		return rest;
	}

	async function extractExerciseSplit(e: SubmitEvent) {
		e.preventDefault();

		callingCreateExerciseSplitEndpoint = true;
		const response = await trpc().exerciseSplits.create.mutate({
			splitName: extractedExerciseSplitName,
			splitDays: mesocycle.mesocycleExerciseSplitDays.map((splitDay, dayIndex) => ({
				name: splitDay.name,
				isRestDay: splitDay.isRestDay,
				dayIndex
			})),
			splitExercises: mesocycle.mesocycleExerciseSplitDays.map((splitDay) =>
				splitDay.mesocycleSplitDayExercises.map((exercise) =>
					convertMesocycleSplitDayExerciseToExerciseSplitDayExercise(exercise)
				)
			)
		});
		callingCreateExerciseSplitEndpoint = false;

		toast.success(response.message);
		extractSplitConfirmDrawerOpen = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex justify-between">
			{mesocycle.name}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger aria-label="mesocycle-options">
					<MenuIcon />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Group>
						<DropdownMenu.Item class="gap-2" onclick={() => loadMesocycle('edit')}>
							<EditIcon /> Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2" onclick={() => loadMesocycle('clone')}>
							<CloneIcon /> Clone
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2" onclick={() => (extractSplitConfirmDrawerOpen = true)}>
							<ExtractIcon /> Extract split
						</DropdownMenu.Item>
						<DropdownMenu.Item class="gap-2 text-red-500" on:click={() => (deleteConfirmDrawerOpen = true)}>
							<DeleteIcon /> Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Card.Title>
		<Card.Description>
			<div class="flex justify-between">
				<p>
					{#if mesocycle.startDate}
						<span>{mesocycle.startDate.toLocaleDateString()}</span>
					{:else}
						No dates available
					{/if}
					{#if mesocycle.endDate}
						to <span>{mesocycle.endDate.toLocaleDateString()}</span>
					{/if}
				</p>
				{#if !mesocycle.startDate}
					<Badge variant="secondary">Unused</Badge>
				{:else if !mesocycle.endDate}
					<Badge>Active</Badge>
				{:else}
					<Badge variant="outline">Completed</Badge>
				{/if}
			</div>
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-3">
		<div class="flex flex-col gap-1">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">RIR progression</span>
				<Badge variant="outline">{arraySum(mesocycle.RIRProgression)} cycles</Badge>
			</div>
			<Resizable.PaneGroup class="min-h-10 w-full rounded-lg border" direction="horizontal">
				{#each mesocycle.RIRProgression.toReversed() as cycles, idx}
					{@const size = (cycles / arraySum(mesocycle.RIRProgression)) * 100}
					<Resizable.Pane class="flex items-center justify-center" maxSize={size} minSize={size}>
						<Popover.Root portal={null}>
							<Popover.Trigger>
								{mesocycle.RIRProgression.length - idx - 1}
							</Popover.Trigger>
							<Popover.Content class="flex w-fit flex-col p-2 text-sm">
								<span>{mesocycle.RIRProgression.length - idx - 1} RIR</span>
								<span class="text-muted-foreground">{cycles} cycles</span>
							</Popover.Content>
						</Popover.Root>
					</Resizable.Pane>
					{#if idx !== mesocycle.RIRProgression.length - 1}
						<Resizable.Handle class="pointer-events-none" />
					{/if}
				{/each}
			</Resizable.PaneGroup>
		</div>
		<div class="flex flex-col">
			<span class="text-sm text-muted-foreground">Start exercise template</span>
			{#if mesocycle.exerciseSplit}
				<a class="font-semibold underline" href="/exercise-splits/{mesocycle.exerciseSplit.id}">
					{mesocycle.exerciseSplit.name}
				</a>
			{:else}
				<span class="font-semibold text-red-500">Deleted</span>
			{/if}
		</div>
		<div class="flex flex-col">
			<span class="text-sm text-muted-foreground">Start overload percentage</span>
			<span class="font-semibold capitalize">
				{mesocycle.startOverloadPercentage}%
			</span>
		</div>
		<div class="flex flex-col gap-1">
			<span id="last-set-to-failure-label" class="text-sm text-muted-foreground"> Last set to failure </span>
			<Switch
				name="mesocycle-last-set-to-failure"
				aria-labelledby="last-set-to-failure-label"
				checked={mesocycle.lastSetToFailure}
				disabled
			/>
		</div>
		<div class="flex flex-col gap-1">
			<span id="force-RIR-matching-label" class="text-sm text-muted-foreground"> Force RIR matching </span>
			<Switch
				name="mesocycle-force-RIR-matching"
				aria-labelledby="force-RIR-matching-label"
				checked={mesocycle.forceRIRMatching}
				disabled
			/>
		</div>
	</Card.Content>
	{#if !mesocycle.endDate}
		<Card.Footer class="justify-end">
			<Button class="w-36" disabled={callingPatchEndpoint} onclick={progressMesocycle}>
				{#if callingPatchEndpoint}
					<LoaderCircle class="animate-spin" />
				{:else}
					{!mesocycle.startDate ? 'Start mesocycle' : 'Stop mesocycle'}
				{/if}
			</Button>
		</Card.Footer>
	{/if}
</Card.Root>

<ResponsiveDialog title="Delete mesocycle?" bind:open={deleteConfirmDrawerOpen}>
	{#snippet description()}
		This action cannot be undone.
	{/snippet}
	<Button class="gap-2" disabled={callingDeleteEndpoint} onclick={deleteMesocycle} variant="destructive">
		{#if callingDeleteEndpoint}
			<LoaderCircle class="animate-spin" />
		{:else}
			Yes, delete
		{/if}
	</Button>
</ResponsiveDialog>

<ResponsiveDialog title="Extract split?" bind:open={extractSplitConfirmDrawerOpen}>
	{#snippet description()}
		Extract the mesocycle's exercise split into an independent exercise split
	{/snippet}
	<form class="contents" onsubmit={extractExerciseSplit}>
		<div class="flex w-full max-w-sm flex-col gap-1.5">
			<Label for="extracted-split-name">Exercise split name</Label>
			<Input id="extracted-split-name" placeholder="Type here" required bind:value={extractedExerciseSplitName} />
		</div>
		<Button class="gap-2" disabled={callingCreateExerciseSplitEndpoint} type="submit">
			{#if callingCreateExerciseSplitEndpoint}
				<LoaderCircle class="animate-spin" />
			{:else}
				Yes, extract
			{/if}
		</Button>
	</form>
</ResponsiveDialog>
