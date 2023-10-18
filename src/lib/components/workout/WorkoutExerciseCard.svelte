<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';
	import ExerciseFeedbackModal from './ExerciseFeedbackModal.svelte';
	import ExerciseDetailsModal from './ExerciseDetailsModal.svelte';
	import EditWorkoutExerciseModal from './EditWorkoutExerciseModal.svelte';
	import MyModal from '../MyModal.svelte';
	import AddWorkoutExerciseModal from './AddWorkoutExerciseModal.svelte';

	export let plannedRIR: number;
	export let workoutPerformed = false;
	export let workoutExercises: WorkoutExercise[];
	export let parentMesocycleName: string | undefined;
	let exerciseFeedbackModal: HTMLDialogElement;

	export let setsPerformedPerExercise: boolean[][];
	if (setsPerformedPerExercise.length === 0) {
		setsPerformedPerExercise = [];
		workoutExercises.forEach((exercise) => {
			setsPerformedPerExercise.push(Array(exercise.repsLoadRIR.length).fill(false));
		});
	}
	let repSelectElements: HTMLSelectElement[][] = [];
	for (let i = 0; i < workoutExercises.length; i++) {
		repSelectElements.push([]);
	}
	function performSet(exerciseNumber: number, setNumber: number) {
		if (workoutExercises[exerciseNumber].repsLoadRIR[setNumber][0] === undefined) {
			repSelectElements[exerciseNumber][setNumber].classList.add('animate-pulse');
			return;
		}
		setsPerformedPerExercise[exerciseNumber][setNumber] = true;
	}

	let feedbackTaken: boolean[] = Array(workoutExercises.length).fill(false);
	let selectedExercise: WorkoutExercise;
	$: workoutExercises.forEach((exercise, i) => {
		let allSetsPerformed = setsPerformedPerExercise[i].every((setPerformed) => setPerformed);
		if (!feedbackTaken[i] && allSetsPerformed) {
			selectedExercise = exercise;
			if (exerciseFeedbackModal) exerciseFeedbackModal.show();
			feedbackTaken[i] = true;
		}
	});

	export let muscleWorkloads: Workout['muscleGroupWorkloads'] = {
		Chest: undefined,
		'Front delts': undefined,
		'Side delts': undefined,
		'Rear delts': undefined,
		Back: undefined,
		Traps: undefined,
		Triceps: undefined,
		Biceps: undefined,
		Forearms: undefined,
		Quads: undefined,
		Hamstrings: undefined,
		Glutes: undefined,
		Calves: undefined
	};

	export let musclesTargetedPreviously: MuscleSorenessData[];

	function editSet(exerciseNumber: number, setNumber: number) {
		setsPerformedPerExercise[exerciseNumber][setNumber] = false;
	}

	let viewingExercise: WorkoutExercise;

	function swapExercises(a: number, b: number) {
		[workoutExercises[b], workoutExercises[a]] = [workoutExercises[a], workoutExercises[b]];
		[setsPerformedPerExercise[b], setsPerformedPerExercise[a]] = [setsPerformedPerExercise[a], setsPerformedPerExercise[b]];
	}

	let deletingExerciseNumber: undefined | number = undefined;
	let deleteExerciseModal: HTMLDialogElement;
	function deleteExercise() {
		if (deletingExerciseNumber === undefined) {
			return false;
		}
		if (workoutExercises.length === 1) {
			errorMsg = 'Need at least one exercise in the workout';
			errorModal.show();
			return false;
		}
		workoutExercises.splice(deletingExerciseNumber, 1);
		setsPerformedPerExercise.splice(deletingExerciseNumber, 1);
		workoutExercises = workoutExercises;
		setsPerformedPerExercise = setsPerformedPerExercise;
		deletingExerciseNumber = undefined;
		return true;
	}

	let openWorkloadAndSorenessModal: () => void;

	let editingExercise: WorkoutExercise;
	let editingExerciseNumber: number;
	let editExerciseModal: HTMLDialogElement;

	let errorModal: HTMLDialogElement;
	let errorMsg = '';

	let addExerciseModal: HTMLDialogElement;
	export const openAddExerciseModal = () => {
		addExerciseModal.show();
	};
</script>

<ExerciseDetailsModal bind:viewingExercise />
<ExerciseFeedbackModal
	bind:exerciseFeedbackModal
	bind:workoutExercises
	bind:selectedExercise
	bind:feedbackTaken
	bind:muscleWorkloads
	bind:musclesTargetedPreviously
	bind:workoutPerformed
	bind:openWorkloadAndSorenessModal
/>
<EditWorkoutExerciseModal
	bind:workoutExercises
	bind:oldExercise={editingExercise}
	bind:i={editingExerciseNumber}
	bind:editExerciseModal
	bind:parentMesocycleName
/>
<AddWorkoutExerciseModal bind:addExerciseModal {plannedRIR} bind:workoutExercises bind:setsPerformedPerExercise />
<MyModal title="Delete exercise" titleColor="text-error" bind:dialogElement={deleteExerciseModal}>
	{#if deletingExerciseNumber !== undefined}
		Are you sure you want to delete <span class="italic font-semibold">{workoutExercises[deletingExerciseNumber].name}</span>
	{/if}
	<div class="join mt-4 w-full grid grid-cols-2">
		<button class="join-item btn"> No </button>
		<button class="join-item btn btn-error text-black" on:click={deleteExercise}>Yes</button>
	</div>
</MyModal>
<MyModal title="Error" titleColor="text-error" bind:dialogElement={errorModal}>
	<p>{errorMsg}</p>
</MyModal>
<ul class="flex flex-col gap-2">
	{#each workoutExercises as exercise, exerciseNumber (exercise.name)}
		<li
			class="flex flex-col bg-secondary w-full rounded-lg text-black p-3 h-fit"
			animate:flip={{ duration: 200 }}
			in:slide|local={{ duration: 200 }}
			out:scale|local={{ duration: 200 }}
		>
			<div class="flex justify-between">
				<h3 class="text-lg font-bold">{exercise.name}</h3>
				<div class="dropdown dropdown-end w-5">
					<button>
						<img src="/HamburgerMenu.svg" alt="menu" />
					</button>
					<div class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md z-10 gap-1">
						<button
							class="btn btn-sm btn-accent"
							on:click={() => {
								viewingExercise = exercise;
							}}>Details</button
						>
						<button
							class="btn btn-sm btn-primary"
							on:click={() => {
								editingExercise = JSON.parse(JSON.stringify(exercise));
								editingExerciseNumber = exerciseNumber;
								editExerciseModal.show();
							}}>Edit</button
						>
						<button
							class="btn btn-sm btn-error text-black"
							on:click={() => {
								deletingExerciseNumber = exerciseNumber;
								deleteExerciseModal.show();
							}}>Delete</button
						>
						<div class="text-white px-0 flex gap-1 items-center mb-1">
							Feedback
							<div class="h-px grow bg-white" />
						</div>
						<button
							class="btn btn-sm btn-primary -mt-2"
							disabled={!setsPerformedPerExercise[exerciseNumber].every((setPerformed) => setPerformed)}
							on:click={() => {
								selectedExercise = exercise;
								exerciseFeedbackModal.show();
							}}>Stimulus</button
						>
						<button
							class="btn btn-sm btn-primary"
							disabled={!setsPerformedPerExercise[exerciseNumber].every((setPerformed) => setPerformed)}
							on:click={() => {
								selectedExercise = exercise;
								openWorkloadAndSorenessModal();
							}}>Workload</button
						>
						<div class="text-white px-0 flex gap-1 items-center mb-1">
							Move
							<div class="h-px grow bg-white" />
						</div>
						<div class="grid grid-cols-2 gap-1 -mt-2">
							<button
								class="btn btn-primary btn-sm text-lg"
								disabled={exerciseNumber === 0}
								on:click={() => {
									swapExercises(exerciseNumber, exerciseNumber - 1);
								}}>↑</button
							>
							<button
								class="btn btn-primary btn-sm text-lg"
								disabled={exerciseNumber === workoutExercises.length - 1}
								on:click={() => {
									swapExercises(exerciseNumber, exerciseNumber + 1);
								}}>↓</button
							>
						</div>
						<div class="text-white px-0 flex gap-1 items-center mb-1">
							Sets
							<div class="h-px grow bg-white" />
						</div>
						<div class="grid grid-cols-2 gap-1 -mt-2">
							<button
								class="btn btn-primary btn-sm text-lg"
								on:click={() => {
									exercise.repsLoadRIR = [
										...exercise.repsLoadRIR,
										structuredClone(exercise.repsLoadRIR[exercise.repsLoadRIR.length - 1])
									];
									setsPerformedPerExercise[exerciseNumber] = [...setsPerformedPerExercise[exerciseNumber], false];
								}}>+</button
							>
							<button
								class="btn btn-primary btn-sm text-lg"
								on:click={() => {
									exercise.repsLoadRIR.pop();
									exercise.repsLoadRIR = exercise.repsLoadRIR;
									setsPerformedPerExercise[exerciseNumber].pop();
									setsPerformedPerExercise[exerciseNumber] = setsPerformedPerExercise[exerciseNumber];
								}}>-</button
							>
						</div>
					</div>
				</div>
			</div>
			<div class="flex justify-between items-end -mt-2">
				<h4 class="capitalize text-sm font-semibold italic flex gap-2 items-center">
					{exercise.setType} sets
					<span class="badge badge-sm badge-info not-italic normal-case"
						>{exercise.repRangeStart} to {exercise.repRangeEnd}</span
					>
				</h4>
				<div class="flex justify-between mt-2.5 text-sm">
					<span class="badge badge-error text-black">{exercise.muscleTarget}</span>
				</div>
			</div>
			{#if exercise.note}
				<p class="bg-warning bg-opacity-50 text-xs px-2 mt-1">{exercise.note}</p>
			{/if}
			<div class="h-px w-full bg-black my-2" />
			<div class="grid grid-cols-4 place-items-center gap-y-2 gap-x-1 overflow-x-auto" id="workout-card-grid">
				<p class="text-sm -mb-1">Reps</p>
				<p class="text-sm -mb-1">Load</p>
				<p class="text-sm -mb-1">RIR</p>
				<p />
				{#each exercise.repsLoadRIR as repLoadRIR, setNumber}
					<select
						class="select select-sm text-white rounded-none disabled:text-opacity-75"
						bind:value={repLoadRIR[0]}
						bind:this={repSelectElements[exerciseNumber][setNumber]}
						disabled={setsPerformedPerExercise[exerciseNumber][setNumber]}
						on:click={() => {
							repSelectElements[exerciseNumber][setNumber].classList.remove('animate-pulse');
						}}
					>
						{#if repLoadRIR[0] === undefined}
							<option value={undefined} disabled>?</option>
						{:else if repLoadRIR[0] === null}
							<option value={null} disabled>?</option>
						{/if}
						{#each Array.from(Array(100).keys()) as i}
							<option>{i + 1}</option>
						{/each}
					</select>
					<select
						class="select select-sm text-white rounded-none disabled:text-opacity-75"
						bind:value={repLoadRIR[1]}
						disabled={setsPerformedPerExercise[exerciseNumber][setNumber]}
					>
						{#each Array.from(Array(100).keys()) as i}
							<option value={(i + 1) * 2.5}>{(i + 1) * 2.5} kg</option>
						{/each}
					</select>
					<select
						class="select select-sm text-white rounded-none disabled:text-opacity-75"
						bind:value={repLoadRIR[2]}
						disabled={setsPerformedPerExercise[exerciseNumber][setNumber]}
					>
						{#each Array.from(Array(5).keys()) as i}
							<option value={i}>{i} RIR</option>
						{/each}
					</select>
					{#if setsPerformedPerExercise[exerciseNumber][setNumber]}
						<button
							class="btn btn-sm btn-ghost btn-square text-black rounded-none"
							on:click={() => {
								editSet(exerciseNumber, setNumber);
							}}
						>
							<img src="/pencil.svg" alt="Edit icon" />
						</button>
					{:else if setsPerformedPerExercise[exerciseNumber].findIndex((setPerformed) => !setPerformed) === setNumber}
						<button
							class="btn btn-sm btn-success border-none btn-square text-white rounded-none"
							on:click={() => performSet(exerciseNumber, setNumber)}>✓</button
						>
					{:else}
						<button class="btn btn-sm bg-gray-400 border-none btn-square text-white rounded-none">✓</button>
					{/if}
				{/each}
			</div>
		</li>
	{/each}
</ul>

<style>
	#workout-card-grid {
		grid-template-columns: auto auto auto auto;
	}
</style>
