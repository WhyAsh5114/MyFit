<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import CloneIcon from 'virtual:icons/clarity/clone-line';
	import EditIcon from 'virtual:icons/lucide/pencil';

	import type { ExerciseSplit, ExerciseSplitDay, ExerciseTemplate } from '@prisma/client';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ExerciseSplitSkeleton from './(components)/ExerciseSplitSkeleton.svelte';
	import ExercisesTableComponent from './(components)/ExercisesTableComponent.svelte';
	import ExerciseSplitExercisesCharts from '../(components)/ExerciseSplitExercisesCharts.svelte';
	import ExerciseSplitMuscleGroupsCharts from '../(components)/ExerciseSplitMuscleGroupsCharts.svelte';

	type FullExerciseSplit = ExerciseSplit & {
		exerciseSplitDays: (ExerciseSplitDay & { exercises: ExerciseTemplate[] })[];
	};

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');

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
					<ExerciseSplitMuscleGroupsCharts
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
				<ExerciseSplitExercisesCharts
					splitExercises={exerciseSplit.exerciseSplitDays.map((splitDay) => splitDay.exercises)}
				/>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
{/if}
