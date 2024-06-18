<script lang="ts">
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import Check from 'virtual:icons/lucide/check';
	import CaretSort from 'virtual:icons/lucide/chevrons-up-down';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { cn } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { ProgressionVariable, type ExerciseSplit } from '@prisma/client';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';
	import InfoPopover from '$lib/components/InfoPopover.svelte';
	let { data } = $props();

	let searchString = $state('');
	let exerciseSplits: ExerciseSplit[] | 'loading' = $state('loading');

	const maxMinSetsValue = Math.min(
		...mesocycleRunes.mesocycleCyclicSetChanges.map((setChange) => setChange.startVolume)
	);
	let selectedExerciseSplit: ExerciseSplit | null = $state(
		mesocycleRunes.selectedExerciseSplit ?? null
	);

	onMount(async () => (exerciseSplits = await data.exerciseSplits));

	function filterExerciseSplits(exerciseSplits: ExerciseSplit[]) {
		const regex = new RegExp(searchString, 'i');
		return exerciseSplits.filter((exerciseSplit) => regex.test(exerciseSplit.name));
	}

	function savePreferencesAndExerciseSplit() {
		if (selectedExerciseSplit === null) {
			toast.error('Select an exercise split');
			return;
		}
		mesocycleRunes.saveStoresToLocalStorage();
		goto(`./volume?exerciseSplitId=${selectedExerciseSplit.id}`);
	}
</script>

<H3>Exercise split</H3>

<span class="mb-0.5 text-sm font-medium">Exercise split</span>
<Popover.Root>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" role="combobox" class="w-full justify-between">
			{#if exerciseSplits !== 'loading'}
				{selectedExerciseSplit === null ? 'Pick one' : selectedExerciseSplit.name}
			{:else}
				{exerciseSplits === 'loading' ? 'Loading...' : 'An error occurred'}
			{/if}
			<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="mt-0.5 p-0" align="start">
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search" class="h-9" bind:value={searchString} />
			{#if exerciseSplits === 'loading'}
				<Command.Empty class="flex items-center justify-center gap-2">
					<LoaderCircle class="h-5 w-5 animate-spin" />
				</Command.Empty>
			{/if}
			<Command.Group>
				{#if exerciseSplits !== 'loading'}
					<div class="flex max-h-32 flex-col overflow-y-auto">
						{#each filterExerciseSplits(exerciseSplits) as exerciseSplit}
							<Command.Item
								value={exerciseSplit.id.toString()}
								onSelect={(currentValue) => {
									if (exerciseSplits === 'loading') return;
									selectedExerciseSplit =
										exerciseSplits.find((split) => split.id === currentValue) ?? null;
								}}
							>
								<Check
									class={cn('mr-2 h-4 w-4', {
										'text-transparent':
											selectedExerciseSplit === null ||
											selectedExerciseSplit.id !== exerciseSplit.id
									})}
								/>
								{exerciseSplit.name}
							</Command.Item>
						{:else}
							<div class="text-sm p-2">No exercise splits found</div>
						{/each}
					</div>
				{/if}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

<div class="mt-2 flex grow flex-col justify-between gap-2">
	{#if selectedExerciseSplit}
		<div class="h-px grow overflow-y-auto">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center justify-between">
						<span>{selectedExerciseSplit.name}</span>
					</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-1 gap-5 md:grid-cols-2">
					<Select.Root
						selected={{
							value: mesocycleRunes.mesocycle.preferredProgressionVariable,
							label: mesocycleRunes.mesocycle.preferredProgressionVariable
						}}
						onSelectedChange={(s) => {
							if (!s) return;
							mesocycleRunes.mesocycle.preferredProgressionVariable = s.value;
						}}
					>
						<div class="flex flex-col gap-1">
							<Select.Label class="flex items-center justify-between p-0 font-medium">
								Preferred progression variable
								<InfoPopover
									ariaLabel="preferred-progression-variable-info"
									text="Prefer adjusting this variable first when reaching the limits of the rep range"
								/>
							</Select.Label>
							<Select.Trigger id="mesocycle-progression-option">
								<Select.Value placeholder="Select" class="capitalize" />
							</Select.Trigger>
							<Select.Content>
								{#each Object.values(ProgressionVariable) as progressionOption}
									<Select.Item value={progressionOption} class="capitalize">
										{progressionOption}
									</Select.Item>
								{/each}
							</Select.Content>
						</div>
					</Select.Root>
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label
							for="distribution-min-sets-per-exercise"
							class="flex items-center justify-between"
						>
							Minimum sets per exercise
							<InfoPopover
								ariaLabel="distribution-min-sets-per-exercise-info"
								text="To avoid excessive exercise variation at the start of the mesocycle"
							/>
						</Label>
						<Input
							type="number"
							step={1}
							min={0}
							max={maxMinSetsValue}
							id="distribution-min-sets-per-exercise"
							placeholder="Type here"
							required
							bind:value={mesocycleRunes.minSets}
						/>
					</div>
					<div class="relative flex items-center justify-between rounded-md border p-2">
						<Label
							for="mesocycle-last-set-to-failure"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Take last set to failure
						</Label>
						<Switch
							id="mesocycle-last-set-to-failure"
							name="mesocycle-last-set-to-failure"
							bind:checked={mesocycleRunes.mesocycle.lastSetToFailure}
						/>
						<InfoPopover
							ariaLabel="mesocycle-last-set-to-failure-info"
							text="Take the last set of each exercise to 0 RIR"
							triggerClasses="absolute -right-0.5 -top-2.5 focus:outline-none"
						/>
					</div>
					<div class="relative flex items-center justify-between rounded-md border p-2">
						<Label
							for="mesocycle-last-set-to-failure"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Force RIR matching
						</Label>
						<Switch
							id="mesocycle-force-RIR-matching"
							name="mesocycle-force-RIR-matching"
							bind:checked={mesocycleRunes.mesocycle.forceRIRMatching}
						/>
						<InfoPopover
							ariaLabel="mesocycle-force-RIR-matching-info"
							text="Whether or not to reduce reps/load to match planned RIR"
							triggerClasses="absolute -right-0.5 -top-2.5 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-2 md:col-span-2">
						<div class="flex items-center justify-between text-sm font-medium">
							<span>Start overload percentage</span>
							<span class="text-muted-foreground">
								{mesocycleRunes.mesocycle.startOverloadPercentage}%
							</span>
						</div>
						<Slider
							value={[mesocycleRunes.mesocycle.startOverloadPercentage]}
							onValueChange={(value) =>
								(mesocycleRunes.mesocycle.startOverloadPercentage = value[0])}
							min={0}
							max={10}
							step={0.25}
						/>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{:else if selectedExerciseSplit === null}
		<div class="muted-text-box">Select an exercise split</div>
	{/if}

	<div class="grid grid-cols-2 gap-1">
		<Button variant="secondary">
			<a href="./basics" class="w-full">Previous</a>
		</Button>
		<Button on:click={savePreferencesAndExerciseSplit}>Next</Button>
	</div>
</div>
