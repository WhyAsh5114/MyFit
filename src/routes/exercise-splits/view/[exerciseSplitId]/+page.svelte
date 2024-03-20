<script lang="ts">
	import H2 from '$lib/components/ui/typography/H2.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import EditIcon from 'virtual:icons/material-symbols/edit';
	import ExerciseTemplateCard from '../../(components)/ExerciseTemplateCard.svelte';
	import PerDayChartComponent from '../../(components)/PerDayChartComponent.svelte';
	import PerMuscleGroupComponent from '../../(components)/PerMuscleGroupComponent.svelte';

	let exerciseSplit: ExerciseSplit;
	let splitDays: ExerciseSplit['splitDays'];
	let selectedDayIndex: string;
	let selectedSplitDay: ExerciseSplitDay | null;
	$: if (splitDays) selectedSplitDay = splitDays[parseInt(selectedDayIndex)];

	onMount(async () => {
		const response = await fetch(`/api/exercise-splits/${$page.params.exerciseSplitId}`);
		if (response.ok) {
			exerciseSplit = await response.json();
			splitDays = exerciseSplit.splitDays;
			selectedDayIndex = splitDays.findIndex((splitDay) => splitDay !== null).toString();
		} else {
			toast.error('Error', { description: await response.text() });
		}
	});

	const emptyFunctions = {
		startDrag: () => {},
		handleKeyDown: () => {},
		openEditExercise: () => {},
		deleteExercise: () => {}
	};
</script>

<H2>View exercise split</H2>

{#if exerciseSplit}
	<Tabs.Root value="info" class="flex w-full grow flex-col">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="info">Info</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
			<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="info">
			<Card.Root>
				<Card.Header>
					<Card.Title>{exerciseSplit.name}</Card.Title>
					<Card.Description>
						<div class="mt-1 flex flex-wrap gap-1">
							{#each exerciseSplit.splitDays as splitDay}
								<Badge variant={splitDay ? 'secondary' : 'outline'}>
									{splitDay?.name ?? 'Rest'}
								</Badge>
							{/each}
						</div>
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2">
					<PerDayChartComponent splitDays={exerciseSplit.splitDays} />
				</Card.Content>
				<Card.Footer>
					<Button class="ml-auto gap-2"><EditIcon />Edit</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="exercises" class="grow">
			<Tabs.Root bind:value={selectedDayIndex} class="flex h-full flex-col">
				<Tabs.List class="w-full shrink-0 justify-start overflow-x-auto">
					{#each splitDays as splitDay, i}
						<Tabs.Trigger
							class="shrink-0 grow basis-20"
							value={i.toString()}
							disabled={splitDay === null}
						>
							{splitDay ? splitDay.name : 'Rest'}
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#if selectedSplitDay}
					<Card.Root class="mt-2 flex h-full flex-col overflow-y-auto p-2">
						<div class="flex items-center gap-3">
							<div class="mr-auto flex flex-col">
								<span class="truncate text-lg font-semibold">{selectedSplitDay.name}</span>
								<span class="font-sembold text-sm text-muted-foreground">
									Day {parseInt(selectedDayIndex) + 1}
								</span>
							</div>
						</div>
						<div class="mt-2 flex h-full flex-col gap-1 overflow-y-auto">
							{#each selectedSplitDay.exerciseTemplates as exercise, idx}
								<ExerciseTemplateCard
									readOnly
									{idx}
									exerciseTemplate={exercise}
									{...emptyFunctions}
								/>
							{/each}
						</div>
					</Card.Root>
				{/if}
			</Tabs.Root>
		</Tabs.Content>
		<Tabs.Content value="stats">
			<Card.Root class="p-2">
				<PerMuscleGroupComponent splitDays={exerciseSplit.splitDays} />
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
{:else}
	<Tabs.Root value="info" class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="info">Info</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
			<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="info">
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<Skeleton class="h-[18px] w-32 rounded-md" />
					</Card.Title>
					<Card.Description>
						<div class="mt-1 flex flex-wrap gap-1">
							{#each Array(7) as _}
								<Skeleton class="h-[22px] w-16 rounded-full" />
							{/each}
						</div>
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2">
					<Skeleton class="h-40 w-full" />
				</Card.Content>
				<Card.Footer>
					<Skeleton class="ml-auto h-10 w-20" />
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="exercises">
			<Card.Root>
				<Card.Header>
					<Card.Title>Password</Card.Title>
					<Card.Description>
						Change your password here. After saving, you'll be logged out.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-2"></Card.Content>
				<Card.Footer>
					<Button>Save password</Button>
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
{/if}
