<script lang="ts">
	import MyModal from './MyModal.svelte';
	import { slide, scale, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let workoutName: string;
	export let exercises: Exercise[] = [];

	let mode: 'normal' | 'adding' | 'deleting' | 'editing' | 'reordering' | 'selecting' = 'normal';
	let exerciseGrid: HTMLDivElement;
	let nameInput: string = '';
	let repsInput: string = '';
	let setsInput: string = '';
	let loadInput: string = '';

	// Modal variables
	let modalTitle: string;
	let modalTexts: string[];
	let modalOpen = false;

	function areInputsValid() {
		let errors: string[] = [];
		if (nameInput === '') {
			errors.push('Enter exercise name');
		}
		if (repsInput === '') {
			errors.push('Enter reps value');
		} else if (isNaN(Number(repsInput)) || Number(repsInput) <= 0) {
			errors.push('Reps should be a positive numeric value');
		}
		if (setsInput === '') {
			errors.push('Enter sets value');
		} else if (isNaN(Number(setsInput)) || Number(setsInput) <= 0) {
			errors.push('Sets should be a positive numeric value');
		}
		if (loadInput === '') {
			errors.push('Enter load value');
		} else if (isNaN(Number(loadInput)) || Number(loadInput) <= 0) {
			errors.push('Load should be a positive numeric value');
		}

		if (errors.length > 0) {
			modalTitle = 'Error';
			modalTexts = errors;
			modalOpen = true;
			return false;
		}
		return true;
	}

	let preDeletionExerciseList: Exercise[] = [];
	function deleteEntry(id: number) {
		if (preDeletionExerciseList.length < exercises.length) {
			preDeletionExerciseList = JSON.parse(JSON.stringify(exercises));
		}
		const indexToRemove = exercises.findIndex((exercise) => exercise.id === id);
		if (indexToRemove === -1) {
			return;
		}
		exercises.splice(indexToRemove, 1);
		exercises = exercises;
	}

	function enterSelectMode() {
		mode = 'selecting';
		for (let i = 0; i < exerciseGrid.children.length; i++) {
			exerciseGrid.children[i].classList.add('animate-pulse');
			exerciseGrid.children[i].classList.add('cursor-pointer');
		}
	}

	let selectedEntry: HTMLDivElement | undefined;
	function editEntry(exercise: Exercise) {
		if (mode !== 'selecting') {
			return;
		}
		const entryToEdit = exerciseGrid.children[exercise.id - 1] as HTMLDivElement;
		selectedEntry = entryToEdit;

		for (let i = 0; i < exerciseGrid.children.length; i++) {
			exerciseGrid.children[i].classList.remove('animate-pulse');
			exerciseGrid.children[i].classList.remove('cursor-pointer');
		}

		selectedEntry.classList.add('animate-pulse');
		selectedEntry.classList.add('border-y-4');
		selectedEntry.classList.add('border-accent');
		mode = 'editing';

		nameInput = exercise.name;
		repsInput = exercise.reps.toString();
		setsInput = exercise.sets.toString();
		loadInput = exercise.sets.toString();
	}

	function enterReorderingMode() {
		mode = 'reordering';
		// Make all entries draggable
		for (let i = 0; i < exerciseGrid.children.length; i++) {
			const entry = exerciseGrid.children[i] as HTMLDivElement;
			entry.draggable = true;
		}
	}

	function saveAction() {
		if (mode === 'adding') {
			// Inputs must be valid to add to the ExerciseArray
			if (areInputsValid() === false) {
				return;
			}
			// Add to the ExerciseArray
			exercises.push({
				id: exercises.length + 1,
				name: nameInput,
				reps: Number(repsInput),
				sets: Number(setsInput),
				load: Number(loadInput)
			});
			// Re-assign to reflect in DOM
			exercises = exercises;
		}
		if (mode === 'deleting') {
			// Update indices of all exercise entries
			for (let i = 0; i < exercises.length; i++) {
				exercises[i].id = i + 1;
			}
			// Clear holder value to avoid weird behaviour
			preDeletionExerciseList = [];
			// Re-assign to reflect in DOM
			exercises = exercises;
		}
		// Nothing was selected and we never entered editing mode
		if (mode === 'selecting') {
			// Remove selecting animations and classes
			for (let i = 0; i < exerciseGrid.children.length; i++) {
				exerciseGrid.children[i].classList.remove('animate-pulse');
				exerciseGrid.children[i].classList.remove('cursor-pointer');
			}
		}
		if (mode === 'editing' && selectedEntry) {
			// Inputs must be valid to change the ExerciseArray
			if (areInputsValid() === false) {
				return;
			}

			// Remove selected hint classes
			selectedEntry.classList.remove('animate-pulse');
			selectedEntry.classList.remove('border-y-4');
			selectedEntry.classList.remove('border-accent');

			// Get selected entry's ID and modify it's values
			// according to input from user
			const selectedID = Number(selectedEntry.children[0].textContent);
			for (let i = 0; i < exercises.length; i++) {
				if (exercises[i].id === selectedID) {
					exercises[i].name = nameInput;
					exercises[i].reps = Number(repsInput);
					exercises[i].sets = Number(setsInput);
					exercises[i].load = Number(loadInput);
				}
			}
			// Re-assign to reflect in DOM
			exercises = exercises;
			// Clear selected entry to avoid weird behaviour
			selectedEntry = undefined;
		}
		if (mode === 'reordering') {
			for (let i = 0; i < exerciseGrid.children.length; i++) {
				const entry = exerciseGrid.children[i] as HTMLDivElement;
				entry.draggable = false;
			}
		}
		// Reset mode
		mode = 'normal';
	}

	function cancelAction() {
		if (mode === 'deleting') {
			// If something WAS deleted
			if (preDeletionExerciseList.length !== 0) {
				// Update the original list
				exercises = JSON.parse(JSON.stringify(preDeletionExerciseList));
			}
			// Clear holder variable to avoid weird behaviour
			preDeletionExerciseList = [];
		}
		// Nothing was selected and we never entered editing mode
		if (mode === 'selecting') {
			// Remove selecting animations and classes
			for (let i = 0; i < exerciseGrid.children.length; i++) {
				exerciseGrid.children[i].classList.remove('animate-pulse');
				exerciseGrid.children[i].classList.remove('cursor-pointer');
			}
		}
		if (mode === 'editing' && selectedEntry) {
			// Remove selected hint classes
			selectedEntry.classList.remove('animate-pulse');
			selectedEntry.classList.remove('border-y-4');
			selectedEntry.classList.remove('border-accent');
			// Clear holder variable to avoid weird behaviour
			selectedEntry = undefined;
		}
		if (mode === 'reordering') {
			for (let i = 0; i < exerciseGrid.children.length; i++) {
				const entry = exerciseGrid.children[i] as HTMLDivElement;
				entry.draggable = false;
			}
		}
		// Reset mode
		mode = 'normal';
	}
</script>

<MyModal modalName="table-modal" {modalTitle} {modalTexts} bind:modalOpen />
<div class="flex flex-col w-full flex-1 rounded-xl my-2.5 bg-primary max-w-xl">
	<h3
		class="w-full text-center text-xl font-bold bg-accent text-black rounded-t-xl pt-1 animate"
		data-test-id="workout-name"
	>
		{workoutName}
	</h3>
	{#key workoutName}
		<div
			class="flex flex-col gap-1 overflow-y-auto flex-auto h-px my-1.5"
			bind:this={exerciseGrid}
			data-test-id="exercise-grid"
		>
			{#each exercises as exercise (exercise.id)}
				<div
					class="flex w-full bg-secondary text-black"
					animate:flip
					in:slide
					out:scale|local
					on:click={() => editEntry(exercise)}
					on:drag={() => console.log('dragged')}
				>
					{#if mode === 'deleting'}
						<button
							class="bg-error basis-8 font-semibold hover:brightness-90 active:brightness-75 transition-all"
							on:click={() => deleteEntry(exercise.id)}
						>
							X
						</button>
					{:else}
						<p class="basis-8 text-center border-r border-black">{exercise.id}</p>
					{/if}
					<p class="flex-grow text-center border-x border-black">{exercise.name}</p>
					<p class="basis-8 text-center border-x border-black">{exercise.reps}</p>
					<p class="basis-8 text-center border-x border-black">{exercise.sets}</p>
					<p class="basis-8 text-center border-l border-black">{exercise.load}</p>
				</div>
			{/each}
		</div>
	{/key}
	{#if ['adding', 'editing'].includes(mode)}
		<div
			class="flex flex-col w-full items-center gap-6 py-5 bg-base-300"
			transition:slide={{ duration: 100 }}
		>
			<div class="flex flex-col w-1/2">
				<p class="text-center bg-primary rounded-t-lg font-semibold">Name</p>
				<input
					type="text"
					class="input input-xs text-base text-center rounded-t-none text-black bg-secondary"
					data-test-id="name-input"
					bind:value={nameInput}
				/>
			</div>
			<div class="grid grid-cols-3 w-full gap-3 place-items-center">
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Reps</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						data-test-id="reps-input"
						bind:value={repsInput}
					/>
				</div>
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Sets</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						data-test-id="sets-input"
						bind:value={setsInput}
					/>
				</div>
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Load</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						data-test-id="load-input"
						bind:value={loadInput}
					/>
				</div>
			</div>
		</div>
	{/if}
	{#if mode === 'normal'}
		<div class="grid grid-cols-4 gap-1" in:fade={{ duration: 150 }}>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-br-none hover:bg-accent hover:brightness-75 no-animation"
				data-test-id="add-button"
				on:click={() => {
					mode = 'adding';
				}}>ADD</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-none rounded-br-none hover:bg-accent hover:brightness-75 no-animation"
				data-test-id="delete-button"
				on:click={() => {
					mode = 'deleting';
				}}>DELETE</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-none rounded-br-none hover:bg-accent hover:brightness-75 no-animation"
				data-test-id="edit-button"
				on:click={enterSelectMode}>EDIT</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-bl-none hover:bg-accent hover:brightness-75 no-animation"
				data-test-id="reorder-button"
				on:click={enterReorderingMode}>REORDER</button
			>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-1" in:fade={{ duration: 150 }}>
			<button
				class="btn btn-sm no-animation btn-accent rounded-t-none rounded-br-none hover:brightness-75"
				on:click={saveAction}
				data-test-id="save-button"
			>
				{#if mode === 'adding'}
					ADD
				{:else}
					SAVE
				{/if}
			</button>
			<button
				class="btn btn-sm no-animation btn-error rounded-t-none rounded-bl-none hover:brightness-75"
				on:click={cancelAction}
				data-test-id="cancel-button">CANCEL</button
			>
		</div>
	{/if}
</div>
