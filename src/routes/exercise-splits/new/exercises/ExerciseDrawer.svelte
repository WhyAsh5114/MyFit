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

	let searching = false;
	let currentExercise: Partial<ExerciseTemplate> = {
		name: '',
		setType: 'straight'
	};

	$: exerciseList = exerciseListByMuscleGroup.map((exerciseListForMuscleGroup) => {
		exerciseListForMuscleGroup = structuredClone(exerciseListForMuscleGroup);
		exerciseListForMuscleGroup.exercises = exerciseListForMuscleGroup.exercises.filter(
			(exercise) => {
				return exercise.name.toLowerCase().includes(currentExercise.name?.toLowerCase() ?? '');
			}
		);
		return exerciseListForMuscleGroup;
	});

	function selectExercise(exercise: ExerciseTemplate) {
		currentExercise = exercise;
		searching = false;
	}
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
				<Command.Root class="bg-background" shouldFilter={false}>
					<Command.Input
						bind:value={currentExercise.name}
						placeholder="Type here or search..."
						onFocus={() => (searching = true)}
					/>
					{#if searching}
						<Command.List class="bg-muted max-h-32">
							{#each exerciseList as exercisesForMuscleGroup}
								{#if exercisesForMuscleGroup.exercises.length > 0}
									<Command.Group heading={exercisesForMuscleGroup.muscleGroup}>
										{#each exercisesForMuscleGroup.exercises as exercise}
											<Command.Item onSelect={() => selectExercise(exercise)}>
												{exercise.name}
											</Command.Item>
										{/each}
									</Command.Group>
								{/if}
							{/each}
						</Command.List>
					{/if}
				</Command.Root>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root
					name="exercise-target-muscle-group"
					selected={{
						value: currentExercise.targetMuscleGroup,
						label: currentExercise.targetMuscleGroup
					}}
					onSelectedChange={(v) => (currentExercise.targetMuscleGroup = v?.value)}
				>
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
						bind:checked={currentExercise.involvesBodyweight}
					/>
				</div>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-sets">Sets</Label>
				<Input
					type="number"
					min={1}
					id="exercise-sets"
					placeholder="Type here"
					bind:value={currentExercise.sets}
				/>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Select.Root
					name="exercise-set-type"
					selected={{ value: currentExercise.setType, label: currentExercise.setType }}
					onSelectedChange={(v) => (currentExercise.setType = v?.value)}
				>
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
				<Input
					id="exercise-rep-range-start"
					min={1}
					type="number"
					placeholder="Type here"
					bind:value={currentExercise.repRangeStart}
				/>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-end">Rep range end</Label>
				<Input
					id="exercise-rep-range-end"
					min={currentExercise.repRangeStart ?? 0 + 1}
					type="number"
					placeholder="Type here"
					bind:value={currentExercise.repRangeEnd}
				/>
			</div>
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<Label for="exercise-note">Note</Label>
				<Textarea
					id="exercise-note"
					placeholder="Exercise cues, machine heights, etc."
					class="resize-none"
					bind:value={currentExercise.note}
				/>
			</div>
			<Button type="submit" class="col-span-2">Add exercise</Button>
		</form>
	</Sheet.Content>
</Sheet.Root>
