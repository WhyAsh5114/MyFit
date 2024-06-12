<script lang="ts">
	import { mesocycleRunes } from '../../mesocycleRunes.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ChevronDown from 'virtual:icons/lucide/chevron-down';

	type NumericReplaceAllType = {
		setChangeProperty: 'startVolume' | 'maxVolume' | 'setIncreaseAmount';
		open: boolean;
		value: number;
		min: number;
		max: number;
	};

	type BooleanReplaceAllType = {
		setChangeProperty: 'regardlessOfProgress';
		open: boolean;
		value: boolean;
	};

	type ReplaceAllType = NumericReplaceAllType | BooleanReplaceAllType;

	const firstSetChange = mesocycleRunes.mesocycleCyclicSetChanges[0];
	let replaceAllStates: ReplaceAllType[] = $state([
		{
			setChangeProperty: 'startVolume',
			open: false,
			value: firstSetChange.startVolume,
			min: 0,
			max: 100
		},
		{
			setChangeProperty: 'maxVolume',
			open: false,
			value: firstSetChange.maxVolume,
			min: 0,
			max: 100
		},
		{
			setChangeProperty: 'setIncreaseAmount',
			open: false,
			value: firstSetChange.setIncreaseAmount,
			min: 0,
			max: 3
		},
		{
			setChangeProperty: 'regardlessOfProgress',
			open: false,
			value: firstSetChange.regardlessOfProgress
		}
	]);

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

<ScrollArea orientation="both" class="h-px grow">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Muscle Group</Table.Head>
				{#each replaceAllStates as state}
					{@const title = convertCamelCaseToNormal(state.setChangeProperty)}
					<Table.Head>
						<Popover.Root bind:open={state.open}>
							<Popover.Trigger class="flex items-center text-left">
								{title}
								<ChevronDown class="shrink-0 basis-4" />
							</Popover.Trigger>
							<Popover.Content class="flex items-end gap-2">
								<form class="contents" onsubmit={(e) => applyChangesToAll(e, state)}>
									{#if typeof state.value === 'boolean'}
										<div class="flex items-center space-x-2 place-self-center">
											<Checkbox
												id="replace-all-{state.setChangeProperty}"
												bind:checked={state.value}
											/>
											<Label
												for="replace-all-{state.setChangeProperty}"
												class="text-sm font-medium leading-none"
											>
												{title}
											</Label>
										</div>
									{:else}
										<div class="flex grow flex-col">
											<Label for="replace-all-{state.setChangeProperty}" class="mb-1.5">
												{title}
											</Label>
											<Input
												type="number"
												id="replace-all-{state.setChangeProperty}"
												placeholder="Type here"
												min={state.min}
												max={state.max}
												required
												bind:value={state.value}
											/>
										</div>
									{/if}
									<Button type="submit">Replace all</Button>
								</form>
							</Popover.Content>
						</Popover.Root>
					</Table.Head>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each mesocycleRunes.mesocycleCyclicSetChanges as setChange}
				{@const muscleGroup = setChange.muscleGroup === 'Custom' ? (setChange.customMuscleGroup as string) : setChange.muscleGroup}
				<Table.Row>
					<Table.Cell class="font-semibold">
						{convertCamelCaseToNormal(muscleGroup)}
					</Table.Cell>
					<Table.Cell>
						<Input
							type="number"
							id="{muscleGroup}-start-volume"
							bind:value={setChange.startVolume}
						/>
					</Table.Cell>
					<Table.Cell>
						<Input type="number" id="{muscleGroup}-max-volume" bind:value={setChange.maxVolume} />
					</Table.Cell>
					<Table.Cell>
						<Select.Root
							selected={{
								value: setChange.setIncreaseAmount,
								label: setChange.setIncreaseAmount.toString()
							}}
							onSelectedChange={(s) => {
								if (!s) return;
								setChange.setIncreaseAmount = s.value;
							}}
						>
							<Select.Trigger class="w-16">
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
						<Checkbox bind:checked={setChange.regardlessOfProgress} />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</ScrollArea>
