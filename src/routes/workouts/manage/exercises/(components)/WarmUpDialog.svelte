<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Table from '$lib/components/ui/table';
	import { untrack } from 'svelte';
	import CalculatorIcon from 'virtual:icons/lucide/calculator';
	import { workoutRunes } from '../../workoutRunes.svelte';

	type WarmUpSet = { reps: number; load: number; oneRMPercentage: number };

	let exercise = $derived(workoutRunes.exerciseWarmUpDialogExercise);
	let oneRepMax = $state<number>();
	let totalWarmUpSets = $state(3);

	let oneRepMaxCalculatorOpen = $state(false);
	let weight = $state<number>();
	let reps = $state<number>();

	let warmUpSets = $state<WarmUpSet[]>();

	$effect(() => {
		if (workoutRunes.exerciseWarmUpDialogExercise) {
			untrack(() => {
				weight = workoutRunes.exerciseWarmUpDialogExercise?.sets[0].load ?? 0;
				reps = workoutRunes.exerciseWarmUpDialogExercise?.sets[0].reps ?? 0;
				warmUpSets = undefined;
				calculateOneRepMax();
			});
		}
	});

	function calculateOneRepMax() {
		if (weight === undefined || reps === undefined) return;
		if (reps > 0) {
			oneRepMax = Math.round(weight * (1 + reps / 30));
		}
	}

	function submitOneRepMax(e: SubmitEvent) {
		e.preventDefault();
		calculateOneRepMax();
		oneRepMaxCalculatorOpen = false;
	}

	function generateWarmUp(e: SubmitEvent) {
		e.preventDefault();
		if (oneRepMax === undefined || totalWarmUpSets === undefined) return;

		warmUpSets = [];
		for (let i = 0; i < totalWarmUpSets; i++) {
			warmUpSets.push({
				reps: Math.round(10 - (7 / (totalWarmUpSets - 1)) * i),
				load: Math.round((oneRepMax * (0.4 + (0.4 / (totalWarmUpSets - 1)) * i)) / 2.5) * 2.5,
				oneRMPercentage: 40 + (40 / (totalWarmUpSets - 1)) * i
			});
		}
	}
</script>

<Sheet.Root bind:open={workoutRunes.exerciseWarmUpDialogOpen}>
	<Sheet.Content class="w-5/6">
		<Sheet.Header>
			<Sheet.Title>Warm up</Sheet.Title>
			<Sheet.Description>{exercise?.name}</Sheet.Description>
		</Sheet.Header>
		{#if exercise}
			<form class="grid gap-2 py-4" onsubmit={generateWarmUp}>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="one-rep-max">One rep max</Label>
					<Input required id="one-rep-max" type="number" step={0.25} placeholder="Type here" bind:value={oneRepMax} />
				</div>
				<div class="flex w-full max-w-sm flex-col gap-1.5">
					<Label for="total-warm-up-sets">Total warm-up sets</Label>
					<Input required id="total-warm-up-sets" type="number" placeholder="Type here" bind:value={totalWarmUpSets} />
				</div>
				<Popover.Root bind:open={oneRepMaxCalculatorOpen} onOpenChange={(v) => (oneRepMaxCalculatorOpen = v)}>
					<Popover.Trigger asChild let:builder>
						<Button variant="secondary" builders={[builder]} class="gap-2">
							1-RM calculator
							<CalculatorIcon />
						</Button>
					</Popover.Trigger>
					<Popover.Content>
						<form onsubmit={submitOneRepMax} class="grid grid-cols-2 gap-1">
							<div class="flex w-full max-w-sm flex-col gap-1.5">
								<Label for="weight">Weight</Label>
								<Input required id="weight" type="number" step={0.25} placeholder="Type here" bind:value={weight} />
							</div>
							<div class="flex w-full max-w-sm flex-col gap-1.5">
								<Label for="reps">Reps</Label>
								<Input required id="reps" type="number" placeholder="Type here" bind:value={reps} />
							</div>
							<Button type="submit" class="col-span-full">Calculate</Button>
						</form>
					</Popover.Content>
				</Popover.Root>
				<Button type="submit">Generate warm up</Button>
			</form>
		{/if}
		{#if warmUpSets}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head></Table.Head>
						<Table.Head>Reps</Table.Head>
						<Table.Head>Load</Table.Head>
						<Table.Head>%RM</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each warmUpSets as warmUpSet, idx}
						<Table.Row>
							<Table.Cell class="font-medium">{idx + 1}</Table.Cell>
							<Table.Cell>{warmUpSet.reps}</Table.Cell>
							<Table.Cell>{warmUpSet.load.toFixed(1)}</Table.Cell>
							<Table.Cell>{warmUpSet.oneRMPercentage}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{/if}
	</Sheet.Content>
</Sheet.Root>
