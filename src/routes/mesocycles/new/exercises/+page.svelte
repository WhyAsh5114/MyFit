<script lang="ts">
	import SplitExercisesTable from './SplitExercisesTable.svelte';
	import AddExerciseModal from './AddExerciseModal.svelte';
	import {
		splitExercises,
		splitSchedule,
		isExercisesValidStore,
		errorMsgs,
		isSplitValidStore
	} from '../newMesoStore';
	import EditExerciseModal from './EditExerciseModal.svelte';
	import type { SplitExercise } from '$lib/global';
	import DeleteExerciseModal from './DeleteExerciseModal.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { days } from '$lib/commonDB';

	let firstValidDayIndex = 0;
	for (let i = 0; i < 7; i++) {
		if ($splitSchedule[i] !== '') {
			firstValidDayIndex = i;
			break;
		}
	}
	let currentDay = days[firstValidDayIndex];

	let addExerciseModal: HTMLDialogElement;

	let editExerciseModal: HTMLDialogElement;
	let currentlyEditingExerciseNumber: number;
	let currentlyEditingExercise: SplitExercise;
	function editExercise(i: number, exercise: SplitExercise) {
		currentlyEditingExerciseNumber = i;
		currentlyEditingExercise = exercise;
		editExerciseModal.show();
	}

	let deleteExerciseModal: HTMLDialogElement;
	let deletingExerciseName: string;
	let indexOfExerciseToDelete: number;
	function deleteExercise(i: number) {
		deletingExerciseName = $splitExercises[days.indexOf(currentDay)][i].name as string;
		indexOfExerciseToDelete = i;
		deleteExerciseModal.show();
	}

	let weeklyCalendar: HTMLInputElement[] = [];
	function isExercisesValid() {
		let invalidDays: string[] = [];
		for (let i = 0; i < 7; i++) {
			if ($splitExercises[i].length === 0 && $splitSchedule[i] !== '') {
				$errorMsgs = ['Add at least one exercise to each non rest day'];
				weeklyCalendar[i].classList.add('animate-pulse');
				invalidDays.push(days[i]);
			}
		}
		if (invalidDays.length !== 0) {
			$errorMsgs[1] = 'Remaining days: ';
			invalidDays.forEach((day) => {
				$errorMsgs[1] += day + ', ';
			});
			$errorMsgs[1] = $errorMsgs[1].substring(0, $errorMsgs[1].length - 2);
			return false;
		}
		return true;
	}
	onMount(() => {
		if (!$isSplitValidStore || !$isSplitValidStore()) {
			goto('/mesocycles/new/split');
		}
		$isExercisesValidStore = isExercisesValid;
	});

	let copiedExercises: SplitExercise[];
	function copyExercises() {
		let todaysExercises = $splitExercises[days.indexOf(currentDay)];
		if (todaysExercises.length > 0) {
			copiedExercises = JSON.parse(JSON.stringify(todaysExercises));
		}
	}

	function pasteExercises() {
		$splitExercises[days.indexOf(currentDay)] = JSON.parse(JSON.stringify(copiedExercises));
	}

	function clearExercises() {
		$splitExercises[days.indexOf(currentDay)] = [];
	}
</script>

<AddExerciseModal bind:addExerciseModal bind:currentDay />
<EditExerciseModal
	bind:editExerciseModal
	bind:currentDay
	bind:oldExercise={currentlyEditingExercise}
	bind:i={currentlyEditingExerciseNumber}
/>
<DeleteExerciseModal
	bind:deleteExerciseModal
	bind:exerciseName={deletingExerciseName}
	bind:currentDay
	bind:indexOfExerciseToDelete
/>

<div class="join w-full justify-between my-2">
	{#each days as day, i}
		{#if $splitSchedule[i] === ''}
			<input
				class="join-item btn btn-square"
				type="radio"
				name="day"
				aria-label={day}
				bind:group={currentDay}
				value={day}
				disabled
			/>
		{:else}
			<input
				class="join-item btn btn-square btn-secondary"
				type="radio"
				name="day"
				aria-label={day}
				bind:group={currentDay}
				value={day}
				on:click={() => {
					weeklyCalendar[i].classList.remove('animate-pulse');
				}}
				bind:this={weeklyCalendar[i]}
			/>
		{/if}
	{/each}
</div>
<SplitExercisesTable
	bind:currentDay
	bind:workoutName={$splitSchedule[days.indexOf(currentDay)]}
	bind:splitExercises={$splitExercises[days.indexOf(currentDay)]}
	{editExercise}
	{deleteExercise}
/>

<div class="join w-full my-2 grid grid-cols-2 gap-1">
	<div class="join grid grid-cols-3 gap-0.5">
		<button class="btn btn-sm btn-primary join-item" on:click={copyExercises}>Copy</button>
		<button
			on:click={pasteExercises}
			class="btn btn-sm btn-primary join-item {copiedExercises ? '' : 'btn-disabled opacity-50'}"
			>Paste</button
		>
		<button class="btn btn-sm btn-primary join-item" on:click={clearExercises}>Clear</button>
	</div>
	<button class="btn btn-sm btn-accent join-item" on:click={() => addExerciseModal.show()}>
		Add Exercise
	</button>
</div>
