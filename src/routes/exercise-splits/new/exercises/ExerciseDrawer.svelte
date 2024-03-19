<script lang="ts">
	import { exerciseListByMuscleGroup, muscleGroups, setTypes } from '$lib/arrays';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Command from '$lib/components/ui/command';
	import AddIcon from 'virtual:icons/material-symbols/add';

	let exerciseSearchString = '';
	$: exerciseList = exerciseListByMuscleGroup.map((exerciseListForMuscleGroup) => {
		exerciseListForMuscleGroup = structuredClone(exerciseListForMuscleGroup);
		exerciseListForMuscleGroup.exercises = exerciseListForMuscleGroup.exercises.filter(
			(exercise) => {
				return exercise.name.toLowerCase().includes(exerciseSearchString.toLowerCase());
			}
		);
		return exerciseListForMuscleGroup;
	});
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" aria-label="add exercise" size="icon">
			<AddIcon />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content class="w-11/12">
		<Sheet.Header>
			<Sheet.Title>Add exercise</Sheet.Title>
		</Sheet.Header>
		<form on:submit|preventDefault class="mt-8 grid h-fit grid-cols-2 gap-x-2 gap-y-4">
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<span class="text-sm font-medium">Exercise name</span>
				<Command.Root class="bg-background">
					<Command.Input bind:value={exerciseSearchString} placeholder="Type here or search..." />
					{#if exerciseSearchString}
						<Command.List>
							{#each exerciseList as exercisesForMuscleGroup}
								{#if exercisesForMuscleGroup.exercises.length > 0}
									<Command.Group heading={exercisesForMuscleGroup.muscleGroup}>
										{#each exercisesForMuscleGroup.exercises as exercise}
											<Command.Item>{exercise.name}</Command.Item>
										{/each}
									</Command.Group>
								{/if}
							{/each}
						</Command.List>
					{/if}
				</Command.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root name="exercise-target-muscle-group">
					<Select.Label class="p-0 text-sm font-medium leading-none">
						Target muscle group
					</Select.Label>
					<Select.Trigger>
						<Select.Value placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content>
						<ScrollArea class="h-64">
							{#each muscleGroups as muscleGroup}
								<Select.Item value={muscleGroup} label={muscleGroup} />
							{/each}
						</ScrollArea>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-involves-bodyweight">Involves bodyweight</Label>
				<div class="flex items-center rounded-md border px-2 py-1.5">
					<Switch
						includeInput
						id="exercise-involves-bodyweight"
						name="exercise-involves-bodyweight"
					/>
				</div>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-sets">Sets</Label>
				<Input type="number" min={1} id="exercise-sets" placeholder="Type here" />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root name="exercise-set-type">
					<Select.Label class="p-0 text-sm font-medium leading-none">Set type</Select.Label>
					<Select.Trigger>
						<Select.Value class="capitalize" placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content>
						{#each setTypes as setType}
							<Select.Item class="capitalize" value={setType} label={setType} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-start">Rep range start</Label>
				<Input id="exercise-rep-range-start" min={1} type="number" placeholder="Type here" />
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-end">Rep range end</Label>
				<Input id="exercise-rep-range-end" type="number" placeholder="Type here" />
			</div>
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<Label for="exercise-note">Note</Label>
				<Textarea
					id="exercise-note"
					placeholder="Exercise cues, machine heights, etc."
					class="resize-none"
				/>
			</div>
			<Button type="submit" class="col-span-2">Add exercise</Button>
		</form>
	</Sheet.Content>
</Sheet.Root>
