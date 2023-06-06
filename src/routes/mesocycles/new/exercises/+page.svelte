<script lang="ts">
	import AddExerciseModal from './AddExerciseModal.svelte';
	import { splitExercises, splitSchedule, isExercisesValidStore, errorMsgs } from '../newMesoStore';
	import IoIosMenu from 'svelte-icons/io/IoIosMenu.svelte';
	import EditExerciseModal from './EditExerciseModal.svelte';
	import type { SplitExercise } from '../../../../../types/global';
	import DeleteExerciseModal from './DeleteExerciseModal.svelte';
	import { flip } from 'svelte/animate';
	import { scale, slide, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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

	function cutExercises() {
		copyExercises();
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
<section class="flex flex-col w-full h-full">
	<h4 class="bg-accent text-black text-center text-lg font-semibold rounded-t-lg">
		{$splitSchedule[days.indexOf(currentDay)]} ({currentDay})
	</h4>
	{#key currentDay}
		<ul
			class="flex flex-col h-px grow bg-primary rounded-b-lg p-2 gap-3 overflow-y-auto"
			in:fly={{ duration: 200, y: 10, opacity: 0 }}
		>
			{#each $splitExercises[days.indexOf(currentDay)] as exercise, i (exercise.name)}
				<li
					class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit"
					animate:flip={{ duration: 200 }}
					in:slide|local={{ duration: 200 }}
					out:scale|local={{ duration: 200 }}
				>
					<div class="flex justify-between">
						<h5 class="text-lg font-bold">{exercise.name}</h5>
						<div class="dropdown dropdown-end w-5">
							<button>
								<IoIosMenu />
							</button>
							<ul class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md">
								<li>
									<button
										class="text-white uppercase font-semibold"
										on:click={() => {
											editExercise(i, exercise);
										}}>Edit</button
									>
								</li>
								<li>
									<button
										class="text-error uppercase font-semibold"
										on:click={() => {
											deleteExercise(i);
										}}>Delete</button
									>
								</li>
							</ul>
						</div>
					</div>
					<h6 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h6>
					<div class="flex justify-between mt-2.5 text-sm">
						<p>{exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd} reps</p>
						<span class="badge badge-error text-white">{exercise.muscleTarget}</span>
					</div>
				</li>
			{/each}
		</ul>
	{/key}
</section>

<div class="join w-full my-2 grid grid-cols-2 gap-1">
	<div class="join grid grid-cols-3 gap-0.5">
		<button class="btn btn-sm btn-primary join-item" on:click={copyExercises}>Copy</button>
		<button
			on:click={pasteExercises}
			class="btn btn-sm btn-primary join-item {copiedExercises ? '' : 'btn-disabled opacity-50'}"
			>Paste</button
		>
		<button class="btn btn-sm btn-primary join-item" on:click={cutExercises}>Cut</button>
	</div>
	<button class="btn btn-sm btn-accent join-item" on:click={() => addExerciseModal.show()}>
		Add Exercise
	</button>
</div>
