<script lang="ts">
	import { mesocycleRunes } from '../../mesocycleRunes.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ChevronDown from 'virtual:icons/lucide/chevron-down';
	import Plus from 'virtual:icons/lucide/plus';
	import { MuscleGroup } from '@prisma/client';
	import type { Selected } from 'bits-ui';
	import { toast } from 'svelte-sonner';

	type NumericReplaceAllType = {
		setChangeProperty: 'startVolume' | 'maxVolume' | 'setIncreaseAmount';
		open: boolean;
		value: number;
		min: number;
		max: number;
		description: string;
	};

	type BooleanReplaceAllType = {
		setChangeProperty: 'regardlessOfProgress';
		open: boolean;
		value: boolean;
		description: string;
	};

	type ReplaceAllType = NumericReplaceAllType | BooleanReplaceAllType;

	const firstSetChange = mesocycleRunes.mesocycleCyclicSetChanges[0];
	let replaceAllStates: ReplaceAllType[] = $state([
		{
			setChangeProperty: 'startVolume',
			open: false,
			value: firstSetChange.startVolume,
			min: 0,
			max: 100,
			description: 'The starting volume of a muscle group for the first microcycle'
		},
		{
			setChangeProperty: 'maxVolume',
			open: false,
			value: firstSetChange.maxVolume,
			min: 0,
			max: 100,
			description: 'The maximum volume of a muscle group to be performed in the mesocycle'
		},
		{
			setChangeProperty: 'setIncreaseAmount',
			open: false,
			value: firstSetChange.setIncreaseAmount,
			min: 0,
			max: 3,
			description: 'Number of sets to increase every microcycle for a muscle group'
		},
		{
			setChangeProperty: 'regardlessOfProgress',
			open: false,
			value: firstSetChange.regardlessOfProgress,
			description: "Apply set increases even if performance doesn't improve"
		}
	]);

	if (mesocycleRunes.editingMesocycleId !== null) {
		replaceAllStates.shift();
	}

	let muscleGroupPopoverOpen = $state(false);
	let selectedMuscleGroup: Selected<string> = $state({ value: 'Chest', label: 'Chest' });
	let customMuscleGroup = $state('');

	function addMuscleGroup(e: SubmitEvent) {
		e.preventDefault();
		const muscleGroup = selectedMuscleGroup.value === 'Custom' ? customMuscleGroup : selectedMuscleGroup.value;
		const successfulAdd = mesocycleRunes.addMuscleGroupToCyclicSetChanges(muscleGroup, false);

		if (successfulAdd) {
			muscleGroupPopoverOpen = false;
			selectedMuscleGroup = { value: 'Chest', label: 'Chest' };
		} else {
			toast.error('Muscle group already present in the table');
		}
	}

	function applyChangesToAll(e: Event, state: ReplaceAllType) {
		e.preventDefault();
		mesocycleRunes.mesocycleCyclicSetChanges.forEach((setChange) => {
			if (typeof state.value === 'boolean' && state.setChangeProperty === 'regardlessOfProgress') {
				setChange[state.setChangeProperty] = state.value;
			} else setChange[state.setChangeProperty] = state.value;
		});
		state.open = false;
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>
				<Popover.Root bind:open={muscleGroupPopoverOpen}>
					<Popover.Trigger class="flex items-center text-left" aria-label="add-muscle-group">
						Muscle Group
						<Plus class="shrink-0 basis-4" />
					</Popover.Trigger>
					<Popover.Content class="flex flex-col gap-2">
						<form class="contents" onsubmit={addMuscleGroup}>
							<div class="flex grow flex-col gap-2">
								<Select.Root
									name="exercise-target-muscle-group"
									onSelectedChange={(v) => {
										if (!v) return;
										selectedMuscleGroup.value = v.value;
									}}
									required
									selected={{
										value: selectedMuscleGroup.value,
										label: convertCamelCaseToNormal(selectedMuscleGroup?.value)
									}}
								>
									<Select.Label class="p-0 text-sm font-medium leading-none">Add muscle group</Select.Label>
									<Select.Trigger>
										<Select.Value placeholder="Pick one" />
									</Select.Trigger>
									<Select.Content class="h-48 overflow-y-auto">
										{#each Object.values(MuscleGroup) as muscleGroup}
											<Select.Item label={convertCamelCaseToNormal(muscleGroup)} value={muscleGroup} />
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							{#if selectedMuscleGroup.value === 'Custom'}
								<div class="flex w-full flex-col gap-1.5">
									<Label for="exercise-custom-muscle-group">Muscle group</Label>
									<Input
										id="exercise-custom-muscle-group"
										placeholder="Type here"
										required
										bind:value={customMuscleGroup}
									/>
								</div>
							{/if}
							<Button type="submit">Add</Button>
							<p class="text-sm leading-tight text-muted-foreground">
								Add muscle groups not currently in the exercise split if you plan to use them later
							</p>
						</form>
					</Popover.Content>
				</Popover.Root>
			</Table.Head>
			{#each replaceAllStates as state}
				{@const title = convertCamelCaseToNormal(state.setChangeProperty)}
				<Table.Head>
					<Popover.Root bind:open={state.open}>
						<Popover.Trigger class="flex items-center text-left">
							{title}
							<ChevronDown class="shrink-0 basis-4" />
						</Popover.Trigger>
						<Popover.Content class="flex flex-col gap-2">
							<form class="flex items-end gap-2" onsubmit={(e) => applyChangesToAll(e, state)}>
								{#if typeof state.value === 'boolean'}
									<div class="flex items-center space-x-2 place-self-center">
										<Checkbox id="replace-all-{state.setChangeProperty}" bind:checked={state.value as boolean} />
										<Label class="text-sm font-medium leading-none" for="replace-all-{state.setChangeProperty}">
											{title}
										</Label>
									</div>
								{:else}
									<div class="flex grow flex-col">
										<Label class="mb-1.5" for="replace-all-{state.setChangeProperty}">
											{title}
										</Label>
										<Input
											id="replace-all-{state.setChangeProperty}"
											max={state.max}
											min={state.min}
											placeholder="Type here"
											required
											type="number"
											bind:value={state.value}
										/>
									</div>
								{/if}
								<Button type="submit">Replace all</Button>
							</form>
							<span class="text-sm leading-tight text-muted-foreground">
								{state.description}
							</span>
						</Popover.Content>
					</Popover.Root>
				</Table.Head>
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each mesocycleRunes.mesocycleCyclicSetChanges as setChange}
			{@const muscleGroup =
				setChange.muscleGroup === 'Custom' ? (setChange.customMuscleGroup as string) : setChange.muscleGroup}
			<Table.Row>
				<Table.Cell class="font-semibold">
					{convertCamelCaseToNormal(muscleGroup)}
				</Table.Cell>
				{#if mesocycleRunes.editingMesocycleId === null}
					<Table.Cell>
						{#if setChange.inSplit}
							<Input
								id="{muscleGroup}-start-volume"
								aria-label="{muscleGroup}-start-volume"
								required
								type="number"
								bind:value={setChange.startVolume}
							/>
						{/if}
					</Table.Cell>
				{/if}
				<Table.Cell>
					<Input
						id="{muscleGroup}-max-volume"
						aria-label="{muscleGroup}-max-volume"
						required
						type="number"
						bind:value={setChange.maxVolume}
					/>
				</Table.Cell>
				<Table.Cell>
					<Select.Root
						onSelectedChange={(s) => {
							if (!s) return;
							if (s.value === 0) setChange.regardlessOfProgress = false;
							setChange.setIncreaseAmount = s.value;
						}}
						required
						selected={{
							value: setChange.setIncreaseAmount,
							label: setChange.setIncreaseAmount.toString()
						}}
					>
						<Select.Trigger class="w-16" aria-label="{muscleGroup}-set-increase-amount">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							{#each [0, 1, 2, 3] as option}
								<Select.Item value={option}>{option}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Table.Cell>
				<Table.Cell class="p-0 text-center">
					<Checkbox
						aria-label="{muscleGroup}-increase-volume-regardless-of-progress"
						disabled={setChange.setIncreaseAmount === 0}
						bind:checked={setChange.regardlessOfProgress as boolean}
					/>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
