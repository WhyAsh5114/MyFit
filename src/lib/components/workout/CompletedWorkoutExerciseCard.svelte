<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';
	import ExerciseFeedbackModal from './ExerciseFeedbackModal.svelte';
	import ExerciseDetailsModal from './ExerciseDetailsModal.svelte';

	export let workoutExercises: WorkoutExercise[];
	let exerciseFeedbackModal: HTMLDialogElement;

	export let setsPerformedPerExercise: number[] = Array(workoutExercises.length).fill(0);
	let repSelectElements: HTMLSelectElement[][] = [];
	for (let i = 0; i < workoutExercises.length; i++) {
		repSelectElements.push(new Array());
	}
	function performSet(exerciseNumber: number, setNumber: number) {
		if (workoutExercises[exerciseNumber].repsLoadRIR[setNumber][0] === undefined) {
			repSelectElements[exerciseNumber][setNumber].classList.add('animate-pulse');
			return;
		}
		setsPerformedPerExercise[exerciseNumber]++;
	}

	let feedbackTaken: boolean[] = Array(workoutExercises.length).fill(false);
	let selectedExercise: WorkoutExercise;
	$: workoutExercises.forEach((exercise, i) => {
		if (!feedbackTaken[i] && exercise.repsLoadRIR.length === setsPerformedPerExercise[i]) {
			selectedExercise = exercise;
			exerciseFeedbackModal.show();
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

	export let muscleSorenessToNextWorkout: Workout['muscleSorenessToNextWorkout'] = {
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

	let viewingExercise: WorkoutExercise;
</script>

<ExerciseFeedbackModal
	bind:exerciseFeedbackModal
	bind:workoutExercises
	bind:selectedExercise
	bind:feedbackTaken
	bind:muscleWorkloads
/>
<ExerciseDetailsModal bind:viewingExercise />
{#each workoutExercises as exercise, exerciseNumber (exercise.name)}
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
				<ul
					class="menu gap-1 dropdown-content p-2 shadow-black bg-base-100 w-52 rounded-md shadow-md border border-primary z-10"
				>
					<div class="grid grid-cols-2 gap-1">
                        <button
                            class="btn btn-sm btn-accent"
                            on:click={() => {
                                viewingExercise = exercise;
                            }}>Details</button
                        >
                        <li class="btn btn-sm btn-error text-black">Delete</li>
                    </div>

					<li class="text-secondary flex flex-row items-center gap-2">
						Sets
						<span class="h-px p-0 grow bg-white" />
					</li>
					<div class="grid grid-cols-2 gap-1">
						<li class="btn btn-sm btn-primary">Add</li>
						<li class="btn btn-sm btn-primary">Remove</li>
					</div>
					<li class="text-secondary flex flex-row items-center gap-2">
						Feedback
						<span class="h-px p-0 grow bg-white" />
					</li>
					<li class="btn btn-sm btn-primary">Stimulus & fatigue</li>
					<li class="btn btn-sm btn-primary">Workload & soreness</li>
				</ul>
			</div>
		</div>
		<div class="flex justify-between items-end -mt-2">
			<h6 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h6>
			<div class="flex justify-between mt-2.5 text-sm">
				<span class="badge badge-error text-white">{exercise.muscleTarget}</span>
			</div>
		</div>
		<div class="h-px w-full bg-black my-2" />
		<div
			class="grid grid-cols-4 place-items-center gap-y-2 gap-x-1 overflow-x-auto"
			id="workout-card-grid"
		>
			<p class="text-sm -mb-1">Reps</p>
			<p class="text-sm -mb-1">Load</p>
			<p class="text-sm -mb-1">RIR</p>
			{#each exercise.repsLoadRIR as repLoadRIR, setNumber}
				<select
					class="select select-sm text-white rounded-none disabled:text-opacity-75"
					bind:value={repLoadRIR[0]}
					bind:this={repSelectElements[exerciseNumber][setNumber]}
					disabled={setNumber < setsPerformedPerExercise[exerciseNumber]}
					on:click={() => {
						repSelectElements[exerciseNumber][setNumber].classList.remove('animate-pulse');
					}}
				>
					<option value={undefined} disabled selected>?</option>
					{#each Array.from(Array(100).keys()) as i}
						<option>{i + 1}</option>
					{/each}
				</select>
				<select
					class="select select-sm text-white rounded-none disabled:text-opacity-75"
					bind:value={repLoadRIR[1]}
					disabled={setNumber < setsPerformedPerExercise[exerciseNumber]}
				>
					{#each Array.from(Array(100).keys()) as i}
						<option value={(i + 1) * 2.5}>{(i + 1) * 2.5} kg</option>
					{/each}
				</select>
				<select
					class="select select-sm text-white rounded-none disabled:text-opacity-75"
					bind:value={repLoadRIR[2]}
					disabled={setNumber < setsPerformedPerExercise[exerciseNumber]}
				>
					{#each Array.from(Array(5).keys()) as i}
						<option value={i}>{i} RIR</option>
					{/each}
				</select>
			{/each}
		</div>
	</li>
{/each}

<style>
	#workout-card-grid {
		grid-template-columns: auto auto auto;
	}
</style>
