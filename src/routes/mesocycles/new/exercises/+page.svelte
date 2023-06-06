<script lang="ts">
	import MyModal from '$lib/MyModal.svelte';
	import { commonMuscleGroups } from '$lib/commonDB';
	import type { SplitExercise } from '../../../../../types/global';
	import { splitExercises, splitSchedule } from '../newMesoStore';
	import IoIosMenu from 'svelte-icons/io/IoIosMenu.svelte';

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	let currentDay = 'Mon';

	let addExerciseModal: HTMLDialogElement;
	let newExercise: SplitExercise = {
		name: undefined,
		sets: undefined,
		setType: undefined,
		muscleTarget: undefined,
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
		if (
			newExercise.repRangeStart === undefined ||
			newExercise.repRangeStart < 1 ||
			newExercise.repRangeStart % 1 !== 0
		) {
			errorMsgs.push('Rep range start should be a positive whole number');
		} else if (
			newExercise.repRangeEnd === undefined ||
			newExercise.repRangeEnd < 1 ||
			newExercise.repRangeEnd % 1 !== 0
		) {
			errorMsgs.push('Rep range end should be a positive whole number');
		} else if (newExercise.repRangeEnd <= newExercise.repRangeStart) {
			errorMsgs.push('Rep range end should be higher than rep range start');
		}

		if (errorMsgs.length === 0) {
			$splitExercises[days.indexOf(currentDay)].push(newExercise);
			// Re-assignment for updating DOM
			$splitExercises[days.indexOf(currentDay)] = $splitExercises[days.indexOf(currentDay)];
			addExerciseModal.close();
			newExercise = {
				name: undefined,
				sets: undefined,
				setType: undefined,
				muscleTarget: undefined,
				repRangeStart: undefined,
				repRangeEnd: undefined
			};
		}
	}
</script>

<MyModal title="Add Exercise" bind:dialogElement={addExerciseModal}>
	<form class="flex flex-col gap-3" on:submit|preventDefault={addExercise}>
		<div class="join mx-auto w-full">
			<p class="btn join-item btn-sm no-animation btn-secondary w-14">Name</p>
			<input
				class="input join-item input-sm w-full"
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
					type="number"
					placeholder="0"
					min="1"
					bind:value={newExercise.sets}
					required
				/>
			</div>
			<select class="select w-2/3 select-sm" bind:value={newExercise.setType} required>
				<option disabled selected value="">Set type</option>
				<option value="straight">Normal (straight) sets</option>
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
				bind:value={newExercise.repRangeStart}
				type="number"
				min="1"
				required
			/>
			<p class="btn join-item btn-sm no-animation btn-secondary w-8">To</p>
			<input
				class="input join-item input-sm w-full"
				placeholder="End"
				bind:value={newExercise.repRangeEnd}
				type="number"
				min={(newExercise.repRangeStart || 0) + 1}
				required
			/>
		</div>
		<select class="select select-sm" required bind:value={newExercise.muscleTarget}>
			<option disabled selected value="">Choose primary muscle target</option>
			{#each commonMuscleGroups as muscleGroup}
				<option>{muscleGroup}</option>
			{/each}
		</select>
		<button class="btn btn-accent btn-block mt-4">Add exercise</button>
	</form>
	<ul class="list-disc ml-5 mt-2 text-error font-semibold">
		{#each errorMsgs as error}
			<li>{error}</li>
		{/each}
	</ul>
</MyModal>

<div class="join w-full justify-between my-2">
	{#each days as day}
		<input
			class="join-item btn btn-square"
			type="radio"
			name="day"
			aria-label={day}
			bind:group={currentDay}
			value={day}
		/>
	{/each}
</div>
<section class="flex flex-col w-full h-full">
	<h4 class="bg-accent text-black text-center text-lg font-semibold rounded-t-lg">
		{$splitSchedule[days.indexOf(currentDay)]}
	</h4>
	<ul class="flex flex-col grow bg-primary rounded-b-lg p-2 gap-3">
		{#each $splitExercises[days.indexOf(currentDay)] as exercise}
			<li class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit">
				<div class="flex justify-between">
					<h5 class="font-semibold">{exercise.name}</h5>
					<button class="w-6">
						<IoIosMenu />
					</button>
				</div>
				<h6 class="capitalize text-sm">{exercise.setType} sets</h6>
				<div class="flex justify-between mt-2.5 text-sm">
					<p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd}</p>
					<span class="badge badge-error text-white">{exercise.muscleTarget}</span>
				</div>
			</li>
		{/each}
	</ul>
</section>

<button class="btn btn-sm btn-primary my-2 btn-block" on:click={() => addExerciseModal.show()}>
	Add Exercise
</button>
