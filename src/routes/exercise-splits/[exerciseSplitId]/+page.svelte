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

	import type { ExerciseSplit, ExerciseSplitDay, ExerciseTemplate } from '@prisma/client';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ExerciseSplitSkeleton from './(components)/ExerciseSplitSkeleton.svelte';
	import ExercisesTableComponent from './(components)/ExercisesTableComponent.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../(components)/ExerciseSplitMuscleGroupsCharts.svelte';
	import ExerciseSplitExercisesCharts from '../(components)/ExerciseSplitExercisesCharts.svelte';
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	type FullExerciseSplit = ExerciseSplit & {
		exerciseSplitDays: (ExerciseSplitDay & { exercises: ExerciseTemplate[] })[];
	};

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');
	let deleteConfirmDrawerOpen = $state(false);
	let callingDeleteEndpoint = $state(false);

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (serverExerciseSplit) exerciseSplit = serverExerciseSplit;
		else toast.error('Exercise split not found');
	});
</script>

<H2>View exercise split</H2>
{#if exerciseSplit === 'loading'}
	<ExerciseSplitSkeleton />
{:else}
	<Tabs.Root value="info" class="flex w-full grow flex-col">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="info">Info</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
			<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
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
									<DropdownMenu.Item class="gap-2" href="/">
										<EditIcon /> Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item class="gap-2" href="/">
										<CloneIcon /> Clone
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="gap-2 text-red-500"
										onclick={() => (deleteConfirmDrawerOpen = true)}
									>
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
		<Tabs.Content value="exercises" class="grow">
			<ExercisesTableComponent exerciseSplitDays={exerciseSplit.exerciseSplitDays} />
		</Tabs.Content>
		<Tabs.Content value="stats">
			<Card.Root class="p-4">
				<ExerciseSplitMuscleGroupsCharts
					splitExercises={exerciseSplit.exerciseSplitDays.map((splitDay) => splitDay.exercises)}
				/>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
	<ResponsiveDialog title="Are you sure?" needTrigger={false} bind:open={deleteConfirmDrawerOpen}>
		<p>
			Delete split <span class="font-semibold">{exerciseSplit.name}</span>? This action cannot be
			undone.
		</p>
		<form
			action="?/delete_exercise_split"
			method="post"
			class="contents"
			use:enhance={() => {
				callingDeleteEndpoint = true;
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success(result.data?.message as string);
						await goto('/exercise-splits');
					} else if (result.type === 'failure') {
						toast.error(result.data?.message as string);
					}
					callingDeleteEndpoint = false;
				};
			}}
		>
			<Button variant="destructive" type="submit" disabled={callingDeleteEndpoint}>
				Yes, delete
				{#if callingDeleteEndpoint}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				{/if}
			</Button>
		</form>
	</ResponsiveDialog>
{/if}
