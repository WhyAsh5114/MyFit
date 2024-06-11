<script lang="ts">
	import { onMount } from 'svelte';
	import type { FullExerciseSplit } from '../../../exercise-splits/manage/exerciseSplitRunes.svelte';
	import { toast } from 'svelte-sonner';
	import { mesocycleRunes } from '../mesocycleRunes.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import H3 from '$lib/components/ui/typography/H3.svelte';
	import MesocycleStartVolumesExercisesTabs from './(components)/MesocycleStartVolumesExercisesTabs.svelte';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { Input } from '$lib/components/ui/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Selected } from 'bits-ui';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { data } = $props();
	let exerciseSplit: FullExerciseSplit | 'loading' = $state('loading');

	onMount(async () => {
		const serverExerciseSplit = await data.exerciseSplit;
		if (!serverExerciseSplit) toast.error('Exercise split not found');
		else {
			exerciseSplit = serverExerciseSplit;
			mesocycleRunes.selectedExerciseSplit = exerciseSplit;
		}
	});

	const setIncreaseOptions: Selected<number>[] = [
		{ label: 'None: 0', value: 0 },
		{ label: 'Normal: 1', value: 1 },
		{ label: 'Specialize: 2', value: 2 },
		{ label: 'Turbo: 3', value: 3 }
	];
</script>

<H3>Start volumes</H3>
{#if exerciseSplit !== 'loading'}
	<Tabs.Root value="distribute" class="flex w-full grow flex-col">
		<Tabs.List class="grid grid-cols-2">
			<Tabs.Trigger value="distribute">Distribute</Tabs.Trigger>
			<Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="distribute" class="grow">
			<div class="flex h-full flex-col gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Distribute volume</Card.Title>
						<Card.Description>
							Use this dialog to spread volumes across exercises in the exercise split
						</Card.Description>
					</Card.Header>
					<Card.Content>Card content</Card.Content>
				</Card.Root>
				<ScrollArea orientation="both" class="h-px grow">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Muscle group</Table.Head>
								<Table.Head>Start volume</Table.Head>
								<Table.Head>Max volume</Table.Head>
								<Table.Head>Cyclic set increment</Table.Head>
								<Table.Head class="text-center">Irrespective of progress</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each mesocycleRunes.mesocycleCyclicSetChanges as setChange}
								{@const muscleGroup =
                          setChange.muscleGroup === 'Custom'
                            ? setChange.customMuscleGroup as string
                            : setChange.muscleGroup}
								<Table.Row>
									<Table.Cell class="font-semibold">
										{convertCamelCaseToNormal(muscleGroup)}
									</Table.Cell>
									<Table.Cell>
										<Input type="number" id="{muscleGroup}-start-volume" value={5} />
									</Table.Cell>
									<Table.Cell>
										<Input
											type="number"
											id="{muscleGroup}-max-volume"
											bind:value={setChange.maxVolume}
										/>
									</Table.Cell>
									<Table.Cell>
										<Select.Root
											selected={setIncreaseOptions.find(
												(option) => option.value === setChange.setIncreaseAmount
											)}
											onSelectedChange={(s) => {
												if (!s) return;
												setChange.setIncreaseAmount = s.value;
											}}
										>
											<Select.Trigger class="w-36">
												<Select.Value />
											</Select.Trigger>
											<Select.Content>
												{#each setIncreaseOptions as option}
													<Select.Item value={option.value}>{option.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Table.Cell>
									<Table.Cell class="p-0 text-center">
										<Checkbox />
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</ScrollArea>
			</div>
		</Tabs.Content>
		<Tabs.Content value="exercises" class="grow">
			<MesocycleStartVolumesExercisesTabs />
		</Tabs.Content>
	</Tabs.Root>
{/if}
