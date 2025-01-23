<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';
	import { commonMuscleGroups, splitExerciseToWorkoutExercise } from '$lib/commonDB';

	export let workoutExercises: WorkoutExercise[];
	export let addExerciseModal: HTMLDialogElement;
	export let plannedRIR: number;
	export let setsPerformedPerExercise: boolean[][];
	export let repSelectElements: HTMLSelectElement[][];
	let newExercise: SplitExercise = {
		name: undefined,
		sets: undefined,
		setType: 'straight',
		muscleTarget: '',
		repRangeStart: undefined,
		repRangeEnd: undefined
	};

	let errorMsgs: string[] = [];
	function addExercise() {
		errorMsgs = [];
		if (newExercise.name === undefined || newExercise.name === '') {
			errorMsgs.push('Please add an exercise name');
		}
		if (newExercise.sets === undefined || newExercise.sets < 1 || newExercise.sets % 1 !== 0) {
			errorMsgs.push('Sets should be a positive whole number');
		}
		if (newExercise.setType === undefined) {
			errorMsgs.push('Please choose a set type');
		}
		if (newExercise.muscleTarget === undefined) {
			errorMsgs.push('Please choose a primary muscle target');
		}
		if (newExercise.repRangeStart === undefined || newExercise.repRangeStart < 1 || newExercise.repRangeStart % 1 !== 0) {
			errorMsgs.push('Rep range start should be a positive whole number');
		} else if (newExercise.repRangeEnd === undefined || newExercise.repRangeEnd < 1 || newExercise.repRangeEnd % 1 !== 0) {
			errorMsgs.push('Rep range end should be a positive whole number');
		} else if (newExercise.repRangeEnd <= newExercise.repRangeStart) {
			errorMsgs.push('Rep range end should be higher than rep range start');
		}

		if (workoutExercises.find((exercise) => exercise.name === newExercise.name) !== undefined) {
			errorMsgs.push('Exercise already exists in this workout, please choose a different name');
		}

		if (errorMsgs.length === 0) {
			workoutExercises.push(splitExerciseToWorkoutExercise(newExercise, plannedRIR));
			setsPerformedPerExercise.push(Array(newExercise.sets).fill(false));
			repSelectElements.push([]);
			// Re-assignment for updating DOM
			workoutExercises = workoutExercises;
			setsPerformedPerExercise = setsPerformedPerExercise;
			addExerciseModal.close();
			newExercise = {
				name: undefined,
				sets: undefined,
				setType: 'straight',
				muscleTarget: '',
				repRangeStart: undefined,
				repRangeEnd: undefined
			};
		}
	}
</script>

<MyModal
	title="Add Exercise"
	bind:dialogElement={addExerciseModal}
	onClose={() => {
		errorMsgs = [];
	}}
>
	<form class="flex flex-col gap-3" on:submit|preventDefault={addExercise}>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-14">Name</p>
			<input
				class="input join-item input-sm w-full"
				name="new-exercise-name"
				placeholder="Type here"
				bind:value={newExercise.name}
				required
			/>
		</div>
		<div class="flex gap-2">
			<div class="join w-1/3">
				<p class="btn join-item btn-sm no-animation btn-secondary w-14">Sets</p>
				<input
					class="input join-item input-sm w-full"
					name="new-exercise-sets"
					type="number"
					placeholder="0"
					min="1"
					bind:value={newExercise.sets}
					required
				/>
			</div>
			<select class="select w-2/3 select-sm" name="new-exercise-set-type" bind:value={newExercise.setType} required>
				<option disabled selected value="">Set type</option>
				<option value="straight">Normal sets</option>
				<option value="drop">Drop sets</option>
				<option value="down">Down sets</option>
				<option value="top">Top sets</option>
				<option value="myorep">Myorep sets</option>
				<option value="myorep match">Myorep match sets</option>
			</select>
		</div>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-1/2">Rep range</p>
			<input
				class="input join-item input-sm w-full"
				name="new-exercise-rep-range-start"
				placeholder="Start"
				bind:value={newExercise.repRangeStart}
				type="number"
				min="1"
				required
			/>
			<p class="btn join-item btn-sm no-animation btn-secondary w-8">To</p>
			<input
				class="input join-item input-sm w-full"
				name="new-exercise-rep-range-end"
				placeholder="End"
				bind:value={newExercise.repRangeEnd}
				type="number"
				min={(newExercise.repRangeStart || 0) + 1}
				required
			/>
		</div>
		<select class="select select-sm" name="new-exercise-muscle-target" required bind:value={newExercise.muscleTarget}>
			<option disabled selected value="">Choose primary muscle target</option>
			{#each commonMuscleGroups as muscleGroup}
				<option>{muscleGroup}</option>
			{/each}
		</select>
		<textarea
			placeholder="Notes"
			class="textarea textarea-bordered textarea-sm w-full resize-none"
			name="new-exercise-notes"
			bind:value={newExercise.note}
		></textarea>
		<button class="btn btn-accent btn-block mt-4">Add exercise</button>
	</form>
	<ul class="list-disc ml-5 mt-2 text-error font-semibold">
		{#each errorMsgs as error}
			<li>{error}</li>
		{/each}
	</ul>
</MyModal>
