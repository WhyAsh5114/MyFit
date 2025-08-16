<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { pascalToNormal } from '$lib/my-utils';
	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { selectedStepsState } from '../../selected-steps.svelte';
	import { macroTrackingQuickstartState } from '../macro-tracking-quickstart-state.svelte';

	$effect(() => {
		if (!macroTrackingQuickstartState.activityAdjustmentType) {
			toast.warning('Select your activity adjustment type first');
			selectedStepsState.navigateToPage(page.url.pathname, 'previous');
		}
	});

	let selectedWeightChange = $state(0);
	let selectedMacroTargetQuantifier = $state<'Percentage' | 'Absolute'>('Percentage');
	let macroDistribution = $state<{ macro: string; value: number | undefined }[]>([
		{ macro: 'proteins', value: 0 },
		{ macro: 'carbs', value: 0 },
		{ macro: 'fats', value: 0 }
	]);

	async function continueToNextPage() {
		if (
			selectedMacroTargetQuantifier === 'Percentage' &&
			macroDistribution.reduce((acc, item) => acc + (item.value ?? 0), 0) > 100
		) {
			return toast.error('Macro targets should not exceed 100%');
		}

		if (
			selectedMacroTargetQuantifier === 'Absolute' &&
			macroDistribution.reduce((acc, item) => acc + (item.value ?? 0), 0) === 0
		) {
			return toast.error('Macro targets should not be all zero');
		}

		macroTrackingQuickstartState.selectedWeightChange = selectedWeightChange;
		macroTrackingQuickstartState.selectedMacroTargetQuantifier = selectedMacroTargetQuantifier;
		macroTrackingQuickstartState.macroDistribution = macroDistribution;

		try {
			await macroTrackingQuickstartState.saveDataToIndexedDB();
			toast.success('Data saved successfully');
			goto('/dashboard');
		} catch (error) {
			if (error instanceof Error) toast.error(error.message);
		}
	}
</script>

<svelte:head>
	<meta name="required" content="true" />
	<meta name="description" content="Select your targets and rates for weight change" />
</svelte:head>

<Card.Root>
	<Card.Content class="flex flex-col">
		<Label class="flex flex-col gap-1.5">
			<span>Weight change per week</span>
			<div class="bg-background grid grid-cols-2 gap-2 rounded-md border p-4">
				<Slider
					class="col-span-full"
					bind:value={selectedWeightChange}
					type="single"
					min={-2}
					step={0.25}
					max={2}
				/>
				<span class="text-muted-foreground">{selectedWeightChange * 7700} kcal</span>
				<span class="text-muted-foreground place-self-end">{selectedWeightChange} kg</span>
			</div>
		</Label>
		<Label class="mt-4 mb-2">Macro targets</Label>
		<Select.Root type="single" bind:value={selectedMacroTargetQuantifier}>
			<Select.Trigger class="w-full">
				{pascalToNormal(selectedMacroTargetQuantifier)}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="percentage">Percentage (%)</Select.Item>
				<Select.Item value="absolute">Absolute (gm)</Select.Item>
			</Select.Content>
		</Select.Root>
		<div class="mt-2 grid grid-cols-3 gap-2 py-2">
			{#each macroDistribution as macroItem (macroItem.macro)}
				<div class="flex flex-col gap-1.5">
					<Label class="flex flex-col items-center gap-1.5">
						<span>{pascalToNormal(macroItem.macro)}</span>
						<Input
							type="number"
							min={0}
							step={selectedMacroTargetQuantifier === 'Percentage' ? 1 : 5}
							class="w-full text-center"
							bind:value={macroItem.value}
							disabled={macroItem.value === undefined}
						/>
						{#if selectedMacroTargetQuantifier === 'Percentage'}
							<span class="text-muted-foreground">%</span>
						{:else}
							<span class="text-muted-foreground">gm</span>
						{/if}
						<Checkbox
							checked={macroItem.value !== undefined}
							onCheckedChange={(checked) => {
								if (checked) macroItem.value = 0;
								else macroItem.value = undefined;
							}}
						/>
					</Label>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<div class="mt-auto grid grid-cols-2 gap-2">
	<Button
		variant="secondary"
		onclick={() => selectedStepsState.navigateToPage(page.url.pathname, 'previous')}
	>
		<ChevronLeftIcon /> Previous
	</Button>
	<Button onclick={continueToNextPage}>Next <ChevronRightIcon /></Button>
</div>
