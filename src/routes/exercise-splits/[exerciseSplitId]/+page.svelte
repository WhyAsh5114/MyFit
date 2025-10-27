<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import CloneIcon from 'virtual:icons/clarity/clone-line';
	import DeleteIcon from 'virtual:icons/lucide/trash';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import FileUpIcon from 'virtual:icons/lucide/file-up';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ExerciseSplitSkeleton from './(components)/ExerciseSplitSkeleton.svelte';
	import ExercisesTableComponent from './(components)/ExercisesTableComponent.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import ExerciseSplitExercisesCharts from '../(components)/ExerciseSplitExercisesCharts.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { goto, invalidate } from '$app/navigation';
	import {
		exerciseSplitRunes,
		type FullExerciseSplit,
		type FullExerciseSplitWithoutIdsOrIndex
	} from '../manage/exerciseSplitRunes.svelte';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';
	import { TRPCClientError } from '@trpc/client';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');
	let editExerciseSplitNoteDrawerOpen = $state(false);
	let deleteConfirmDrawerOpen = $state(false);
	let callingDeleteEndpoint = $state(false);

	let selectedTabValue = $state('info');
	let chartMode = $state(false);

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (serverExerciseSplit) exerciseSplit = serverExerciseSplit;
		else toast.error('Exercise split not found');
	});

	async function deleteExerciseSplit() {
		callingDeleteEndpoint = true;
		try {
			const response = await trpc().exerciseSplits.deleteById.mutate($page.params.exerciseSplitId!);
			toast.success(response.message);
			await invalidate('exerciseSplits:all');
			await goto('/exercise-splits');
		} catch (error) {
			if (error instanceof TRPCClientError) toast.error(error.message);
		}
		callingDeleteEndpoint = false;
	}

	function getExerciseSplitWithoutIds(exerciseSplit: FullExerciseSplit) {
		const noIdsSplit: FullExerciseSplitWithoutIdsOrIndex = {
			name: exerciseSplit.name,
			exerciseSplitDays: exerciseSplit.exerciseSplitDays.map(({ name, isRestDay, exercises }) => ({
				name,
				isRestDay,
				exercises: exercises.map(({ id, exerciseSplitDayId, ...exerciseTemplate }) => exerciseTemplate)
			}))
		};
		return noIdsSplit;
	}

	function loadExerciseSplit(mode: 'edit' | 'clone') {
		if (exerciseSplit === 'loading') return;
		if (mode === 'edit') {
			editExerciseSplitNoteDrawerOpen = true;
		} else if (mode === 'clone') {
			exerciseSplitRunes.loadExerciseSplit(getExerciseSplitWithoutIds(exerciseSplit));
			goto(`/exercise-splits/manage/structure`);
		}
	}

	function editExerciseSplit() {
		if (exerciseSplit === 'loading') return;
		exerciseSplitRunes.loadExerciseSplit(getExerciseSplitWithoutIds(exerciseSplit), exerciseSplit.id);
		goto(`/exercise-splits/manage/structure`);
	}

	function exportSplit() {
		if (exerciseSplit === 'loading') return;

		const { userId, id, ...rest } = exerciseSplit;
		(rest.exerciseSplitDays as unknown) = rest.exerciseSplitDays.map((day) => {
			const { id, exerciseSplitId, ...rest } = day;
			(rest.exercises as unknown) = rest.exercises.map((ex) => {
				const { id, exerciseSplitDayId, ...rest } = ex;
				return rest;
			});
			return rest;
		});

		const jsonData = JSON.stringify(rest);
		const blob = new Blob([jsonData], { type: 'application/json' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${exerciseSplit.name}.json`;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<H2 showChartIcon={selectedTabValue === 'exercises'} bind:chartMode>View exercise split</H2>

{#if exerciseSplit === 'loading'}
	<ExerciseSplitSkeleton />
{:else}
	<Tabs.Root class="flex w-full grow flex-col" bind:value={selectedTabValue}>
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="info">Info</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="info">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex justify-between">
						{exerciseSplit.name}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger aria-label="exercise-split-options">
								<MenuIcon />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Group>
									<DropdownMenu.Item class="gap-2" onclick={() => loadExerciseSplit('edit')}>
										<EditIcon /> Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item class="gap-2" onclick={() => loadExerciseSplit('clone')}>
										<CloneIcon /> Clone
									</DropdownMenu.Item>
									<DropdownMenu.Item class="gap-2" onclick={() => exportSplit()}>
										<FileUpIcon /> Export
									</DropdownMenu.Item>
									<DropdownMenu.Item class="gap-2 text-red-500" onclick={() => (deleteConfirmDrawerOpen = true)}>
										<DeleteIcon /> Delete
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Card.Title>
					<Card.Description>
						<div class="mt-1 flex flex-wrap gap-1">
							{#each exerciseSplit.exerciseSplitDays as splitDay}
								<Badge variant={splitDay.isRestDay ? 'outline' : 'secondary'}>
									{splitDay.isRestDay ? 'Rest' : splitDay.name}
								</Badge>
							{/each}
						</div>
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<ExerciseSplitExercisesCharts
						exercises={exerciseSplit.exerciseSplitDays.flatMap((splitDay) => splitDay.exercises)}
					/>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content class="grow" value="exercises">
			{#if chartMode}
				<Card.Root class="p-4">
					<ExerciseSplitMuscleGroupsCharts
						splitExercises={exerciseSplit.exerciseSplitDays.map((splitDay) => splitDay.exercises)}
					/>
				</Card.Root>
			{:else}
				<ExercisesTableComponent exerciseSplitDays={exerciseSplit.exerciseSplitDays} />
			{/if}
		</Tabs.Content>
	</Tabs.Root>
	<ResponsiveDialog title="Delete split?" bind:open={deleteConfirmDrawerOpen}>
		{#snippet description()}
			This action cannot be undone.
		{/snippet}
		<Button disabled={callingDeleteEndpoint} onclick={deleteExerciseSplit} variant="destructive">
			{#if callingDeleteEndpoint}
				<LoaderCircle class="animate-spin" />
			{:else}
				Yes, delete
			{/if}
		</Button>
	</ResponsiveDialog>
{/if}

<ResponsiveDialog title="Note" bind:open={editExerciseSplitNoteDrawerOpen}>
	{#snippet description()}
		Editing an exercise split won't change the mesocycle split it is used in. To modify that, use the <b>Split</b> tab
		in <b>View mesocycle</b>
	{/snippet}
	<Button onclick={editExerciseSplit}>Continue</Button>
</ResponsiveDialog>
