<script lang="ts">
	import { goto } from '$app/navigation';
	import InfoPopover from '$lib/components/InfoPopover.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import { cn } from '$lib/utils.js';
	import { type ExerciseSplit } from '@prisma/client';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Check from 'virtual:icons/lucide/check';
	import CaretSort from 'virtual:icons/lucide/chevrons-up-down';
	import LoaderCircle from 'virtual:icons/lucide/loader-circle';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	let { data } = $props();

	let searchString = $state('');
	let exerciseSplits: ExerciseSplit[] | 'loading' = $state('loading');

	const maxMinSetsValue = Math.min(
		...mesocycleRunes.mesocycleCyclicSetChanges.map((setChange) => setChange.startVolume)
	);
	let selectedExerciseSplit: ExerciseSplit | null = $state(mesocycleRunes.selectedExerciseSplit ?? null);

	onMount(async () => (exerciseSplits = await data.exerciseSplits));

	function filterExerciseSplits(exerciseSplits: ExerciseSplit[]) {
		const regex = new RegExp(searchString, 'i');
		return exerciseSplits.filter((exerciseSplit) => regex.test(exerciseSplit.name));
	}

	function savePreferencesAndExerciseSplit() {
		if (mesocycleRunes.editingMesocycleId !== null) {
			goto(`./volume?editing`);
			return;
		}
		if (selectedExerciseSplit === null) {
			toast.error('Select an exercise split');
			return;
		}
		mesocycleRunes.saveStoresToLocalStorage();
		goto(`./volume?exerciseSplitId=${selectedExerciseSplit.id}`);
	}
</script>

<H3>Progression</H3>

{#if mesocycleRunes.editingMesocycleId === null}
	<span class="mb-0.5 text-sm font-medium">Starting exercise split</span>
	<Popover.Root>
		<Popover.Trigger asChild let:builder>
			<Button class="w-full justify-between" builders={[builder]} role="combobox" variant="outline">
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
				<Command.Input class="h-9" placeholder="Search" bind:value={searchString} />
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
									onSelect={(currentValue) => {
										if (exerciseSplits === 'loading') return;
										selectedExerciseSplit = exerciseSplits.find((split) => split.id === currentValue) ?? null;
									}}
									value={exerciseSplit.id.toString()}
								>
									<Check
										class={cn('mr-2 h-4 w-4', {
											'text-transparent':
												selectedExerciseSplit === null || selectedExerciseSplit.id !== exerciseSplit.id
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
{:else}
	<div class="muted-text-box flex justify-between gap-2 text-sm">
		Starting exercise split cannot be changed
		<InfoPopover ariaLabel="exercise-split-editing-info">
			To modify the split, use the <b>Split</b> tab in <b>View mesocycle</b>
		</InfoPopover>
	</div>
{/if}

<div class="mt-2 flex grow flex-col justify-between gap-2">
	<div class="h-px grow overflow-y-auto">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center justify-between">
					<span>Progression settings</span>
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-5 md:grid-cols-2">
				<div class="relative flex items-center justify-between rounded-md border p-2">
					<Label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="mesocycle-last-set-to-failure"
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
						triggerClasses="absolute -right-0.5 -top-2.5 focus:outline-none"
					>
						Take the last set of each exercise to 0 RIR
					</InfoPopover>
				</div>
				<div class="relative flex items-center justify-between rounded-md border p-2">
					<Label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="mesocycle-last-set-to-failure"
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
						triggerClasses="absolute -right-0.5 -top-2.5 focus:outline-none"
					>
						Whether or not to reduce reps/load to match planned RIR
					</InfoPopover>
				</div>
				{#if mesocycleRunes.editingMesocycleId === null}
					<div class="flex w-full max-w-sm flex-col gap-1.5">
						<Label class="flex items-center justify-between" for="distribution-min-sets-per-exercise">
							Minimum sets per exercise
							<InfoPopover ariaLabel="distribution-min-sets-per-exercise-info">
								To avoid excessive exercise variation at the start of the mesocycle
							</InfoPopover>
						</Label>
						<Input
							id="distribution-min-sets-per-exercise"
							max={maxMinSetsValue}
							min={0}
							placeholder="Type here"
							required
							step={1}
							type="number"
							bind:value={mesocycleRunes.minSets}
						/>
					</div>
				{/if}
				<div class="flex flex-col gap-2 md:col-span-2">
					<div class="flex items-center justify-between text-sm font-medium">
						<span>Start overload percentage</span>
						<span class="text-muted-foreground">
							{mesocycleRunes.mesocycle.startOverloadPercentage}%
						</span>
					</div>
					<Slider
						max={10}
						min={0}
						onValueChange={(value) => (mesocycleRunes.mesocycle.startOverloadPercentage = value[0])}
						step={0.25}
						value={[mesocycleRunes.mesocycle.startOverloadPercentage]}
					/>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid grid-cols-2 gap-1">
		<Button variant="secondary">
			<a class="w-full" href="./basics">Previous</a>
		</Button>
		<Button onclick={savePreferencesAndExerciseSplit}>Next</Button>
	</div>
</div>
