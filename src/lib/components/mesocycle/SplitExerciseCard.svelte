<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';
	import EditExerciseModal from './EditExerciseModal.svelte';
	import DeleteExerciseModal from './DeleteExerciseModal.svelte';

	export let splitExercises: SplitExercise[];

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
		deletingExerciseName = splitExercises[i].name as string;
		indexOfExerciseToDelete = i;
		deleteExerciseModal.show();
	}
</script>

<EditExerciseModal
	bind:editExerciseModal
	bind:splitExercises
	bind:oldExercise={currentlyEditingExercise}
	bind:i={currentlyEditingExerciseNumber}
/>
<DeleteExerciseModal
	bind:deleteExerciseModal
	bind:exerciseName={deletingExerciseName}
	bind:splitExercises
	bind:indexOfExerciseToDelete
/>
{#each splitExercises as exercise, i (exercise.name)}
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
					<img src="/HamburgerMenu.svg" alt="menu" />
				</button>
				<ul class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md z-10">
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
