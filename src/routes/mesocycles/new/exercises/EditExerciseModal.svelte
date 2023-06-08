<script lang="ts">
	import MyModal from '$lib/MyModal.svelte';
	import { commonMuscleGroups, days } from '$lib/commonDB';
	import type { SplitExercise } from '../../../../../types/global';
	import { splitExercises } from '../newMesoStore';

	export let currentDay = 'Mon';

	export let editExerciseModal: HTMLDialogElement;
	export let oldExercise: SplitExercise = {
		name: undefined,
		sets: undefined,
		setType: '',
		muscleTarget: '',
		repRangeStart: undefined,
		repRangeEnd: undefined
	};
	export let i: number;

	let errorMsgs: string[] = [];
	function editExercise() {
		errorMsgs = [];
		if (oldExercise.name === undefined || oldExercise.name === '') {
			errorMsgs.push('Please add an exercise name');
		}
		if (oldExercise.sets === undefined || oldExercise.sets < 1 || oldExercise.sets % 1 !== 0) {
			errorMsgs.push('Sets should be a positive whole number');
		}
		if (oldExercise.setType === undefined) {
			errorMsgs.push('Please choose a set type');
		}
		if (oldExercise.muscleTarget === undefined) {
			errorMsgs.push('Please choose a primary muscle target');
		}
		if (
			oldExercise.repRangeStart === undefined ||
			oldExercise.repRangeStart < 1 ||
			oldExercise.repRangeStart % 1 !== 0
		) {
			errorMsgs.push('Rep range start should be a positive whole number');
		} else if (
			oldExercise.repRangeEnd === undefined ||
			oldExercise.repRangeEnd < 1 ||
			oldExercise.repRangeEnd % 1 !== 0
		) {
			errorMsgs.push('Rep range end should be a positive whole number');
		} else if (oldExercise.repRangeEnd <= oldExercise.repRangeStart) {
			errorMsgs.push('Rep range end should be higher than rep range start');
		}

		if (
			$splitExercises[days.indexOf(currentDay)].find(
				(exercise, ind) => exercise.name === oldExercise.name && ind !== i
			) !== undefined
		) {
			errorMsgs.push('Exercise already exists in this workout, please choose a different name');
		}

		if (errorMsgs.length === 0) {
			$splitExercises[days.indexOf(currentDay)][i] = oldExercise;
			// Re-assignment for updating DOM
			$splitExercises[days.indexOf(currentDay)] = $splitExercises[days.indexOf(currentDay)];
			editExerciseModal.close();
		}
	}
</script>

<MyModal title="Edit Exercise" bind:dialogElement={editExerciseModal}>
	<form class="flex flex-col gap-3" on:submit|preventDefault={editExercise}>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-14">Name</p>
			<input
				class="input join-item input-sm w-full"
				placeholder="Type here"
				bind:value={oldExercise.name}
				required
			/>
		</div>
		<div class="flex gap-2">
			<div class="join w-1/3">
				<p class="btn join-item btn-sm no-animation btn-secondary w-14">Sets</p>
				<input
					class="input join-item input-sm w-full"
					type="number"
					placeholder="0"
					min="1"
					bind:value={oldExercise.sets}
					required
				/>
			</div>
			<select class="select w-2/3 select-sm" bind:value={oldExercise.setType} required>
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
		<select class="select select-sm" required bind:value={oldExercise.muscleTarget}>
			<option disabled selected value="">Choose primary muscle target</option>
			{#each commonMuscleGroups as muscleGroup}
				<option>{muscleGroup}</option>
			{/each}
		</select>
		<button class="btn btn-accent btn-block mt-4">Edit exercise</button>
	</form>
	<ul class="list-disc ml-5 mt-2 text-error font-semibold">
		{#each errorMsgs as error}
			<li>{error}</li>
		{/each}
	</ul>
</MyModal>
