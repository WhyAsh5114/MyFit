<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { solveBrzyckiFormula, type WorkoutExerciseInProgress } from '$lib/utils/workoutUtils';
	import CheckIcon from 'virtual:icons/lucide/check';
	import RemoveIcon from 'virtual:icons/lucide/minus';
	import EditIcon from 'virtual:icons/lucide/pencil';
	import AddIcon from 'virtual:icons/lucide/plus';
	import UndoIcon from 'virtual:icons/lucide/undo';
	import TargetIcon from 'virtual:icons/lucide/target';
	import { workoutRunes } from '../../workoutRunes.svelte';
	import { arraySum, floorToNearestMultiple } from '$lib/utils';

	type PropsType = { exercise: WorkoutExerciseInProgress; originalSetLoads: (number | undefined)[] };
	type WorkoutExerciseSet = WorkoutExerciseInProgress['sets'][number];
	let { exercise = $bindable(), originalSetLoads = $bindable() }: PropsType = $props();

	let isSameLoadExercise = $derived(['Straight', 'Myorep', 'MyorepMatch'].includes(exercise.setType));

	function shouldSetBeDisabled(set: WorkoutExerciseSet, idx: number): boolean {
		if (set.completed) return false;
		if (idx === 0) return false;
		const previousSet = exercise.sets[idx - 1];
		if (previousSet.miniSets.length === 0) return !previousSet.completed;
		return !previousSet.miniSets[previousSet.miniSets.length - 1].completed;
	}

	function completeSet(e: SubmitEvent, set: WorkoutExerciseSet, idx: number) {
		e.preventDefault();
		if (set.skipped) {
			set.skipped = false;
			return;
		}
		set.completed = !set.completed;
		if (['Straight', 'Myorep', 'MyorepMatch'].includes(exercise.setType) && idx === 0)
			exercise.sets.forEach((_set) => (_set.load = set.load));

		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}

	function shouldMiniSetBeDisabled(setIndex: number, miniSetIndex: number) {
		const parentSet = exercise.sets[setIndex];
		if (miniSetIndex === 0) return !parentSet.completed;
		return !parentSet.miniSets[miniSetIndex - 1].completed;
	}

	function addMiniSet(setIndex: number) {
		exercise.sets[setIndex].miniSets.push({
			completed: false,
			reps: undefined,
			load: exercise.setType === 'MyorepMatch' ? exercise.sets[setIndex].load : undefined,
			RIR: undefined
		});
	}

	function completeMiniSet(e: SubmitEvent, set: WorkoutExerciseSet, miniSetIndex: number) {
		e.preventDefault();
		set.miniSets[miniSetIndex].completed = !set.miniSets[miniSetIndex].completed;
		workoutRunes.workoutExercises = workoutRunes.workoutExercises;
	}

	function calculateNextLoad(setIdx: number) {
		const firstSet = exercise.sets[0];
		if (typeof firstSet.load !== 'number') return 0;
		if (!exercise.changeType || setIdx === 0) return 0;
		if (exercise.changeAmount === null || exercise.changeAmount === undefined) return 0;

		if (exercise.setType === 'Down') setIdx = -setIdx;
		if (exercise.changeType === 'AbsoluteLoad') {
			return firstSet.load + setIdx * exercise.changeAmount;
		}
		return firstSet.load * (1 + setIdx * (exercise.changeAmount / 100));
	}

	function getNextLoad(setIdx: number) {
		if (!['Top', 'Down'].includes(exercise.setType)) return;
		if (typeof exercise.sets[0].load !== 'number') return;
		return floorToNearestMultiple(calculateNextLoad(setIdx), exercise.minimumWeightChange ?? 5).toString();
	}

	function getRemainingMyorepMatchReps(setIdx: number) {
		const firstSet = exercise.sets[0];
		const set = exercise.sets[setIdx];
		if (firstSet.reps === undefined) return;
		if (set.reps === undefined) return firstSet.reps;
		return firstSet.reps - set.reps - arraySum(set.miniSets.map((miniSet) => miniSet.reps ?? 0));
	}

	function getMiniSetLoad(setIdx: number, miniSetIdx: number) {
		if (exercise.setType !== 'Drop') return;
		if (exercise.changeAmount === null || exercise.changeAmount === undefined) return;
		let set = exercise.sets[setIdx];

		if (typeof set.load === 'number') {
			if (exercise.changeType === 'AbsoluteLoad') return set.load - (miniSetIdx + 1) * exercise.changeAmount;
			return set.load * (1 - (miniSetIdx + 1) * (exercise.changeAmount / 100));
		}
	}

	function adjustLoads(setIdx: number) {
		let extraOverloadAchieved = 0;
		const exerciseSet = exercise.sets[setIdx];
		const newLoad = exerciseSet.load;
		const oldLoad = originalSetLoads[setIdx];
		if (newLoad === undefined || oldLoad === undefined) return;

		if (!isSameLoadExercise) {
			if (exerciseSet.reps === undefined || exerciseSet.RIR === undefined) return;
			const newReps = Math.round(
				solveBrzyckiFormula({
					variableToSolve: 'NewReps',
					knownValues: {
						oldSet: { reps: exerciseSet.reps, load: oldLoad, RIR: exerciseSet.RIR },
						newSet: { load: newLoad, RIR: exerciseSet.RIR },
						oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
						newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
						bodyweightFraction: exercise.bodyweightFraction ?? null
					}
				})
			);
			exercise.sets[setIdx] = { ...exerciseSet, reps: newReps, load: newLoad };
			originalSetLoads[setIdx] = newLoad;
			return;
		}

		exercise.sets.forEach((set, setIdx) => {
			if (set.reps === undefined || set.RIR === undefined) return;

			const newReps = Math.round(
				solveBrzyckiFormula({
					variableToSolve: 'NewReps',
					knownValues: {
						oldSet: { reps: set.reps, load: oldLoad, RIR: set.RIR },
						newSet: { load: newLoad, RIR: set.RIR },
						oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
						newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
						bodyweightFraction: exercise.bodyweightFraction ?? null,
						overloadPercentage: -extraOverloadAchieved
					}
				})
			);

			extraOverloadAchieved += solveBrzyckiFormula({
				variableToSolve: 'OverloadPercentage',
				knownValues: {
					oldSet: { reps: set.reps, load: oldLoad, RIR: set.RIR },
					newSet: { reps: newReps, load: newLoad, RIR: set.RIR },
					oldUserBodyweight: workoutRunes.previousWorkoutData?.userBodyweight,
					newUserBodyweight: workoutRunes.workoutData?.userBodyweight as number,
					bodyweightFraction: exercise.bodyweightFraction ?? null
				}
			});

			exercise.sets[setIdx] = { ...set, reps: newReps, load: newLoad };
			originalSetLoads[setIdx] = newLoad;
		});
	}
</script>

<div class="grid grid-cols-4 gap-1">
	<span class="text-center text-sm font-medium">Reps</span>
	<span class="text-center text-sm font-medium">
		Load
		{#if typeof exercise.bodyweightFraction === 'number'}
			<span class="text-xs font-semibold text-muted-foreground">(BW)</span>
		{/if}
	</span>
	<span class="text-center text-sm font-medium">RIR</span>
	<span></span>
	{#each exercise.sets as set, idx}
		<form class="contents" onsubmit={(e) => completeSet(e, set, idx)}>
			{#if !set.skipped}
				<Input
					id="{exercise.name}-set-{idx + 1}-reps"
					disabled={set.completed || set.skipped}
					min={0}
					required
					type="number"
					bind:value={set.reps}
				/>
				{#if idx === 0 || !isSameLoadExercise}
					<Input
						id="{exercise.name}-set-{idx + 1}-load"
						disabled={set.completed || set.skipped}
						min={0}
						placeholder={getNextLoad(idx)}
						required
						step={0.25}
						type="number"
						bind:value={set.load}
					/>
				{:else if exercise.setType === 'MyorepMatch'}
					<span></span>
				{:else}
					<span></span>
				{/if}
				<Input
					id="{exercise.name}-set-{idx + 1}-RIR"
					disabled={set.completed || set.skipped}
					min={0}
					required
					type="number"
					bind:value={set.RIR}
				/>
			{:else}
				<div class="col-span-3 flex items-center gap-2">
					<Separator class="w-px grow" />
					<span class="text-sm text-muted-foreground">skipped</span>
					<Separator class="w-px grow" />
				</div>
			{/if}
			<div class="flex items-center">
				{#if idx === 0 || !isSameLoadExercise}
					{@const hasLoadChanged = set.load !== originalSetLoads[idx] && originalSetLoads[idx] !== undefined}
					{#if hasLoadChanged}
						<Button
							class="h-7 w-7 p-1"
							data-testid="{exercise.name}-set-{idx + 1}-adjust-reps"
							onclick={() => adjustLoads(idx)}
							variant="outline"
						>
							<TargetIcon />
						</Button>
					{/if}
				{/if}
				<Button
					class="ml-auto"
					data-testid="{exercise.name}-set-{idx + 1}-action"
					disabled={shouldSetBeDisabled(set, idx)}
					size="icon"
					type="submit"
					variant={set.completed ? 'outline' : 'default'}
				>
					{#if set.skipped}
						<UndoIcon />
					{:else if !set.completed}
						<CheckIcon />
					{:else}
						<EditIcon />
					{/if}
				</Button>
			</div>
		</form>
		{#if (idx > 0 && exercise.setType === 'MyorepMatch') || exercise.setType === 'Drop'}
			{#each set.miniSets as miniSet, miniIdx}
				{@const miniSetButtonDisabled = shouldMiniSetBeDisabled(idx, miniIdx)}
				{#if set.skipped}
					<div class="col-span-3 flex items-center gap-2">
						<Separator class="w-px grow" />
						<span class="text-sm text-muted-foreground">skipped</span>
						<Separator class="w-px grow" />
					</div>
					<Button class="place-self-end" disabled size="icon" variant="secondary">
						<CheckIcon />
					</Button>
				{:else}
					<form class="contents" onsubmit={(e) => completeMiniSet(e, set, miniIdx)}>
						<Input
							id="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-reps"
							disabled={miniSet.completed}
							min={0}
							required
							type="number"
							bind:value={miniSet.reps}
						/>
						{#if exercise.setType === 'MyorepMatch'}
							<span></span>
						{:else}
							{@const expectedLoad = getMiniSetLoad(idx, miniIdx)}
							<Input
								id="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-load"
								disabled={miniSet.completed}
								min={0}
								placeholder={expectedLoad === undefined ? expectedLoad : expectedLoad.toString()}
								required
								step={0.25}
								type="number"
								bind:value={miniSet.load}
							/>
						{/if}
						<Input
							id="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-RIR"
							disabled={miniSet.completed}
							min={0}
							required
							type="number"
							bind:value={miniSet.RIR}
						/>
						<Button
							class="place-self-end"
							data-testid="{exercise.name}-set-{idx + 1}-mini-set-{miniIdx + 1}-action"
							disabled={miniSetButtonDisabled}
							size="icon"
							type="submit"
							variant={miniSet.completed ? 'outline' : 'default'}
						>
							{#if !miniSet.completed}
								<CheckIcon />
							{:else}
								<EditIcon />
							{/if}
						</Button>
					</form>
				{/if}
			{/each}
			<Button
				aria-label="add-mini-set-to-set-{idx + 1}-of-{exercise.name}"
				onclick={() => addMiniSet(idx)}
				variant="secondary"
			>
				<AddIcon />
			</Button>
			<Button
				aria-label="remove-mini-set-from-set-{idx + 1}-of-{exercise.name}"
				disabled={set.miniSets.length === 0}
				onclick={() => set.miniSets.pop()}
				variant="secondary"
			>
				<RemoveIcon />
			</Button>
			{#if exercise.setType === 'MyorepMatch'}
				{@const repsLeft = getRemainingMyorepMatchReps(idx)}
				<span class="grid place-items-center text-sm font-medium text-primary">
					{#if repsLeft && repsLeft > 0}
						{repsLeft} {repsLeft === 1 ? 'rep' : 'reps'} left
					{:else if typeof repsLeft === 'number'}
						matched
					{/if}
				</span>
			{:else}
				<span></span>
			{/if}
			<span></span>
		{/if}
	{/each}
</div>
