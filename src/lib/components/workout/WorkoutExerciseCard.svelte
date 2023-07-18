<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';
	import ExerciseFeedbackModal from './ExerciseFeedbackModal.svelte';

	export let workoutExercises: WorkoutExercise[];
	let exerciseFeedbackModal: HTMLDialogElement;

	export let setsPerformedPerExercise: boolean[][] = [];
	workoutExercises.forEach((exercise) => {
		setsPerformedPerExercise.push(Array(exercise.repsLoadRIR.length).fill(false));
	});
	let repSelectElements: HTMLSelectElement[][] = [];
	for (let i = 0; i < workoutExercises.length; i++) {
		repSelectElements.push(new Array());
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
	console.log(setsPerformedPerExercise);
	$: workoutExercises.forEach((exercise, i) => {
		let allSetsPerformed = setsPerformedPerExercise[i].every((setPerformed) => setPerformed);
		if (!feedbackTaken[i] && allSetsPerformed) {
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

	export let musclesTargetedPreviously: MuscleSorenessData[];

	function editSet(exerciseNumber: number, setNumber: number) {
		setsPerformedPerExercise[exerciseNumber][setNumber] = false;
	}
</script>

<ExerciseFeedbackModal
	bind:exerciseFeedbackModal
	bind:workoutExercises
	bind:selectedExercise
	bind:feedbackTaken
	bind:muscleWorkloads
	bind:musclesTargetedPreviously
/>
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
					<ul class="menu dropdown-content p-2 shadow-black bg-base-100 rounded-md shadow-md z-10">
						<li />
					</ul>
				</div>
			</div>
			<div class="flex justify-between items-end -mt-2">
				<h4 class="capitalize text-sm font-semibold italic">{exercise.setType} sets</h4>
				<div class="flex justify-between mt-2.5 text-sm">
					<span class="badge badge-error text-black">{exercise.muscleTarget}</span>
				</div>
			</div>
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
						<option value={undefined} disabled selected>?</option>
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
					{:else if setsPerformedPerExercise[exerciseNumber].findIndex(setPerformed => !setPerformed) === setNumber}
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
