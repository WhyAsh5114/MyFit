<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';
	import { commonMuscleGroups } from '$lib/commonDB';

	export let workoutExercises: WorkoutExercise[];
	export let editExerciseModal: HTMLDialogElement;
	export let parentMesocycleName: string | undefined;
	export let oldExercise: WorkoutExercise = {
		name: '',
		setType: 'straight',
		muscleTarget: 'Biceps',
		repRangeStart: 5,
		repRangeEnd: 10,
		repsLoadRIR: [[undefined, undefined, 0]],
		jointPainRating: undefined,
		pumpRating: undefined,
	};
	export let i: number;

	let errorMsgs: string[] = [];
	function editExercise() {
		errorMsgs = [];
		if (oldExercise.name === '') {
			errorMsgs.push('Please add an exercise name');
		}
		if (oldExercise.repRangeStart === undefined || oldExercise.repRangeStart < 1 || oldExercise.repRangeStart % 1 !== 0) {
			errorMsgs.push('Rep range start should be a positive whole number');
		} else if (oldExercise.repRangeEnd === undefined || oldExercise.repRangeEnd < 1 || oldExercise.repRangeEnd % 1 !== 0) {
			errorMsgs.push('Rep range end should be a positive whole number');
		} else if (oldExercise.repRangeEnd <= oldExercise.repRangeStart) {
			errorMsgs.push('Rep range end should be higher than rep range start');
		}

		if (
			workoutExercises.find((exercise, exerciseIndex) => exercise.name === oldExercise.name && exerciseIndex !== i) !==
			undefined
		) {
			errorMsgs.push('Exercise already exists in this workout, please choose a different name');
		}

		if (errorMsgs.length === 0) {
			workoutExercises[i] = oldExercise;
			// Re-assignment for updating DOM
			workoutExercises = workoutExercises;
			editExerciseModal.close();
		}
	}
</script>

<MyModal title="Edit Exercise" bind:dialogElement={editExerciseModal}>
	<form class="flex flex-col gap-3" on:submit|preventDefault={editExercise}>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-14">Name</p>
			<input class="input join-item input-sm w-full" placeholder="Type here" bind:value={oldExercise.name} required />
		</div>
		<div class="grid grid-cols-2 gap-2">
			<select class="select select-sm" bind:value={oldExercise.setType} required>
				<option disabled selected value="">Set type</option>
				<option value="straight">Normal sets</option>
				<option value="drop">Drop sets</option>
				<option value="down">Down sets</option>
				<option value="top">Top sets</option>
				<option value="myorep">Myorep sets</option>
				<option value="myorep match">Myorep match sets</option>
			</select>
			<select class="select select-sm" required bind:value={oldExercise.muscleTarget}>
				{#each commonMuscleGroups as muscleGroup}
					<option>{muscleGroup}</option>
				{/each}
			</select>
		</div>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-1/2">Rep range</p>
			<input
				class="input join-item input-sm w-full"
				placeholder="Start"
				bind:value={oldExercise.repRangeStart}
				type="number"
				min="1"
				required
			/>
			<p class="btn join-item btn-sm no-animation btn-secondary w-8">To</p>
			<input
				class="input join-item input-sm w-full"
				placeholder="End"
				bind:value={oldExercise.repRangeEnd}
				type="number"
				min={(oldExercise.repRangeStart || 0) + 1}
				required
			/>
		</div>
		<textarea
			placeholder="Notes"
			class="textarea textarea-bordered textarea-sm w-full resize-none"
			bind:value={oldExercise.note}
		></textarea>
		<div class="flex flex-col">
			<label class="label cursor-pointer w-fit gap-2">
				<input type="checkbox" class="toggle" />
				<span class="label-text">Save change to <span class="font-semibold italic">{parentMesocycleName}</span></span>
			</label>
		</div>
		<button class="btn btn-accent btn-block mt-4">Edit exercise</button>
	</form>
	<ul class="list-disc ml-5 mt-2 text-error font-semibold">
		{#each errorMsgs as error}
			<li>{error}</li>
		{/each}
	</ul>
</MyModal>
