<script lang="ts">
	import ResponsiveDialog from '$lib/components/ResponsiveDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import H2 from '$lib/components/ui/typography/H2.svelte';

	import ExerciseTemplateCard from '../../(components)/ExerciseTemplateCard.svelte';
	import PerDayChartComponent from '../../(components)/PerDayChartComponent.svelte';
	import PerMuscleGroupComponent from '../../(components)/PerMuscleGroupComponent.svelte';

	import CloneIcon from 'virtual:icons/clarity/clone-line';
	import DeleteIcon from 'virtual:icons/material-symbols/delete';
	import MenuIcon from 'virtual:icons/material-symbols/menu';
	import EditIcon from 'virtual:icons/material-symbols/edit';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { editingExerciseSplitIdStore, exerciseSplitStore } from '../../[mode]/exerciseSplitStore';

	let exerciseSplit: WithSID<ExerciseSplit>;
	let deleteConfirmDrawerOpen = false;
	let callingEndpoint = false;
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

	async function deleteExerciseSplit() {
		callingEndpoint = true;
		const response = await fetch(`/api/exercise-splits/${exerciseSplit._id}`, { method: 'DELETE' });
		callingEndpoint = false;

		if (response.ok) {
			deleteConfirmDrawerOpen = false;
			toast.success('Success', {
				description: `Exercise split deleted successfully`
			});
			goto('/exercise-splits');
		} else toast.error(`Error ${response.status}`, { description: await response.text() });
	}

	function editExerciseSplit() {
		$editingExerciseSplitIdStore = exerciseSplit._id;
		const exerciseSplitWithoutId: ExerciseSplit & { _id?: string } = exerciseSplit;
		delete exerciseSplitWithoutId._id;
		$exerciseSplitStore = exerciseSplitWithoutId;
		goto('/exercise-splits/edit');
	}

	function cloneSplit() {
		// TODO
	}
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
					<Card.Title class="flex justify-between">
						{exerciseSplit.name}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger><MenuIcon /></DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Group>
									<DropdownMenu.Item class="gap-2" on:click={cloneSplit}>
										<CloneIcon /> Clone
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="gap-2 text-red-500"
										on:click={() => (deleteConfirmDrawerOpen = true)}
									>
										<DeleteIcon /> Delete
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Card.Title>
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
					<Button class="ml-auto gap-2" on:click={editExerciseSplit}><EditIcon /> Edit</Button>
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
	</Tabs.Root>
{/if}

<ResponsiveDialog title="Are you sure?" needTrigger={false} bind:open={deleteConfirmDrawerOpen}>
	<p>
		Delete split <span class="font-semibold">{exerciseSplit.name}</span>? This action cannot be
		undone.
	</p>
	<Button variant="destructive" on:click={deleteExerciseSplit} disabled={callingEndpoint}>
		{#if callingEndpoint}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Yes, delete
	</Button>
</ResponsiveDialog>
