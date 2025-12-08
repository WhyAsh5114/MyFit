<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { MUSCLE_GROUPS } from '$lib/constants';
	import { type ExerciseSplitDaySessionExercise, SetType } from '$lib/generated/prisma/client';
	import { pascalToNormal } from '$lib/my-utils';
	import { cn } from '$lib/utils.js';
	import { Check, ChevronDown, ChevronsUpDown, PlusIcon } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';

	type PropsType = {
		currentExercise?: Partial<
			Omit<ExerciseSplitDaySessionExercise, 'id' | 'exerciseIndex' | 'exerciseSplitDaySessionId'>
		>;
	};
	let {
		currentExercise = {
			name: '',
			repRangeStart: 5,
			repRangeEnd: 15,
			setType: SetType.Straight
		}
	}: PropsType = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button size="icon" variant="outline" {...props}><PlusIcon /></Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content class="w-11/12">
		<Sheet.Header>
			<Sheet.Title>Add exercise</Sheet.Title>
		</Sheet.Header>
		<div class="grid grid-cols-2 gap-4 px-4">
			<Popover.Root>
				<Popover.Trigger class="col-span-full">
					{#snippet child({ props })}
						<Button variant="outline" class="w-full justify-between" {...props} role="combobox">
							{currentExercise.name || 'Select an exercise to add...'}
							<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-(--bits-popover-anchor-width) p-0">
					<Command.Root>
						<Command.Input class="text-sm" placeholder="Search exercises..." />
						<Command.List>
							<Command.Empty>Use custom</Command.Empty>
							<Command.Group>
								{#each ['Barbell bench press'] as exercise (exercise)}
									<Command.Item
										value={exercise}
										onSelect={() => {
											currentExercise.name = exercise;
										}}
									>
										<Check
											class={cn(
												'mr-2 size-4',
												exercise !== currentExercise.name && 'text-transparent'
											)}
										/>
										{exercise}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="rep-range-start">Rep range start</Label>
				<Input
					type="number"
					min={1}
					id="rep-range-start"
					placeholder="5"
					bind:value={currentExercise.repRangeStart}
				/>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="rep-range-end">Rep range end</Label>
				<Input
					type="number"
					min={(currentExercise.repRangeStart ?? 0) + 1}
					id="rep-range-end"
					placeholder="15"
					bind:value={currentExercise.repRangeEnd}
				/>
			</div>
			<Label class="flex flex-col items-start gap-1.5">
				Set type
				<Select.Root type="single" bind:value={currentExercise.setType}>
					<Select.Trigger class="w-full">{currentExercise.setType}</Select.Trigger>
					<Select.Content align="start">
						{#each Object.values(SetType) as setType (setType)}
							<Select.Item value={setType}>{pascalToNormal(setType)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Label>
			<div class="flex flex-col gap-1.5">
				<span class="text-sm leading-none font-medium">Primary target</span>
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" class="w-full justify-between" {...props} role="combobox">
								{currentExercise.primaryMuscleGroup || 'Pick one'}
								<ChevronDown class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-fit p-0" align="end">
						<Command.Root>
							<Command.Input class="text-sm" placeholder="Search muscle groups..." />
							<Command.List>
								<Command.Empty>Use custom</Command.Empty>
								<Command.Group>
									{#each Object.values(MUSCLE_GROUPS) as muscleGroup (muscleGroup)}
										<Command.Item
											value={muscleGroup}
											onSelect={() => (currentExercise.primaryMuscleGroup = muscleGroup)}
										>
											<Check
												class={cn(
													muscleGroup !== currentExercise.primaryMuscleGroup && 'text-transparent'
												)}
											/>
											{muscleGroup}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
