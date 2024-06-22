<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import AddIcon from 'virtual:icons/lucide/plus';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Command from '$lib/components/ui/command';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import Input from '$lib/components/ui/input/input.svelte';
	import { mesocycleExerciseSplitRunes } from '../../mesocycleExerciseSplitRunes.svelte';
	import { toast } from 'svelte-sonner';
	import { ChangeType, MuscleGroup, type Prisma, SetType } from '@prisma/client';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { commonExercisePerMuscleGroup } from '$lib/common/commonExercises';

	type ExerciseTemplateWithoutIds = Prisma.ExerciseTemplateCreateWithoutExerciseSplitDayInput;
	type MesocycleExerciseTemplateWithoutIds =
		Prisma.MesocycleExerciseTemplateCreateWithoutMesocycleExerciseSplitDayInput;

	const defaultExercise: Partial<MesocycleExerciseTemplateWithoutIds> = {
		name: '',
		setType: 'Straight',
		involvesBodyweight: false
	};

	let open = $state(false);
	let mode = $derived(mesocycleExerciseSplitRunes.editingExercise === undefined ? 'Add' : 'Edit');
	let searching = $state(false);
	let currentExercise: Partial<MesocycleExerciseTemplateWithoutIds> = $state(
		structuredClone(defaultExercise)
	);

	$effect(() => {
		if (mesocycleExerciseSplitRunes.editingExercise) {
			currentExercise = structuredClone($state.snapshot(mesocycleExerciseSplitRunes.editingExercise));
			open = true;
		}
	});

	function selectExercise(exercise: ExerciseTemplateWithoutIds) {
		currentExercise = structuredClone(exercise);
		searching = false;
	}

	function resetDrawerState() {
		mesocycleExerciseSplitRunes.editingExercise = undefined;
		currentExercise = structuredClone(defaultExercise);
	}

	function submitForm() {
		let result: boolean;
		const finishedExercise = currentExercise as MesocycleExerciseTemplateWithoutIds;
		if (mode === 'Add') result = mesocycleExerciseSplitRunes.addExercise(finishedExercise);
		else result = mesocycleExerciseSplitRunes.editExercise(finishedExercise);

		if (!result) {
			toast.error('Exercise names should be unique');
			return;
		}
		resetDrawerState();
		open = false;
	}
</script>

<Sheet.Root closeOnOutsideClick={false} bind:open>
	<Sheet.Trigger asChild let:builder>
		<Button
			size="icon"
			variant="outline"
			builders={[builder]}
			aria-label="add-exercise"
			onclick={resetDrawerState}
		>
			<AddIcon />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="w-11/12 overflow-y-auto px-4">
		<Sheet.Header>
			<Sheet.Title>{mode} exercise</Sheet.Title>
		</Sheet.Header>
		<form onsubmit={submitForm} class="mt-8 grid h-fit grid-cols-2 gap-x-2 gap-y-4">
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<span class="text-sm font-medium">Exercise name</span>
				<Command.Root class="bg-background">
					<Command.Input
						bind:value={currentExercise.name}
						placeholder="Type here or search..."
						onFocus={() => (searching = true)}
						required
					/>
					{#if searching}
						<Command.List class="max-h-32 bg-muted">
							{#each commonExercisePerMuscleGroup as exercisesForMuscleGroup}
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
			<div
				class="flex w-full flex-col gap-1.5 {currentExercise.targetMuscleGroup === 'Custom'
					? 'col-span-1'
					: 'col-span-2'}"
			>
				<Select.Root
					name="exercise-target-muscle-group"
					selected={{
						value: currentExercise.targetMuscleGroup,
						label: convertCamelCaseToNormal(currentExercise.targetMuscleGroup)
					}}
					onSelectedChange={(v) => (currentExercise.targetMuscleGroup = v?.value)}
					required
				>
					<Select.Label class="p-0 text-sm font-medium leading-none">
						Target muscle group
					</Select.Label>
					<Select.Trigger>
						<Select.Value placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content class="h-48 overflow-y-auto">
						{#each Object.values(MuscleGroup) as muscleGroup}
							<Select.Item value={muscleGroup} label={convertCamelCaseToNormal(muscleGroup)} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			{#if currentExercise.targetMuscleGroup === 'Custom'}
				<div class="flex w-full flex-col gap-1.5">
					<Label for="exercise-custom-muscle-group">Muscle group</Label>
					<Input
						id="exercise-custom-muscle-group"
						placeholder="Type here"
						bind:value={currentExercise.customMuscleGroup}
						required
					/>
				</div>
			{/if}
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
				<Select.Root
					name="exercise-set-type"
					selected={{
						value: currentExercise.setType,
						label: convertCamelCaseToNormal(currentExercise.setType)
					}}
					onSelectedChange={(v) => (currentExercise.setType = v?.value ?? 'Straight')}
					required
				>
					<Select.Label class="p-0 text-sm font-medium leading-none">Set type</Select.Label>
					<Select.Trigger>
						<Select.Value placeholder="Pick one" />
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(SetType) as setTemplate}
							<Select.Item value={setTemplate} label={convertCamelCaseToNormal(setTemplate)} />
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
					required
				/>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="exercise-rep-range-end">Rep range end</Label>
				<Input
					id="exercise-rep-range-end"
					min={(currentExercise.repRangeStart ?? 0) + 1}
					type="number"
					placeholder="Type here"
					bind:value={currentExercise.repRangeEnd}
					required
				/>
			</div>
			{#if currentExercise.setType === 'Drop' || currentExercise.setType === 'Down' || currentExercise.setType === 'Top'}
				<div class="flex w-full flex-col gap-1.5">
					<Select.Root
						name="exercise-set-change-type"
						selected={{
							value: currentExercise.changeType ?? 'Percentage',
							label: currentExercise.changeType
								? convertCamelCaseToNormal(currentExercise.changeType)
								: 'Percentage'
						}}
						onSelectedChange={(v) => {
							if (
								currentExercise.setType === 'Drop' ||
								currentExercise.setType === 'Down' ||
								currentExercise.setType === 'Top'
							)
								currentExercise.changeType = v?.value ?? 'Percentage';
						}}
						required
					>
						<Select.Label class="p-0 text-sm font-medium leading-none">
							Load change type
						</Select.Label>
						<Select.Trigger>
							<Select.Value placeholder="Pick one" />
						</Select.Trigger>
						<Select.Content>
							{#each Object.values(ChangeType) as changeType}
								<Select.Item value={changeType} label={convertCamelCaseToNormal(changeType)} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex w-full flex-col gap-1.5">
					<Label for="exercise-rep-range-end">Load change</Label>
					<Input
						id="exercise-set-decrement"
						placeholder="Type here"
						type="number"
						bind:value={currentExercise.changeAmount}
						required
					/>
				</div>
			{/if}
			<div class="col-span-2 flex w-full flex-col gap-1.5">
				<Label for="exercise-note">Note</Label>
				<Textarea
					id="exercise-note"
					placeholder="Exercise cues, machine heights, etc."
					class="resize-none"
					bind:value={currentExercise.note}
				/>
			</div>
			<Button type="submit" class="col-span-2">{mode} exercise</Button>
		</form>
	</Sheet.Content>
</Sheet.Root>
