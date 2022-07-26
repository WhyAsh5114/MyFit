<script lang="ts">
	import MyModal from './MyModal.svelte';
	import { fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let workoutName: string;
	export let exercises: Exercise[];

	let mode: 'normal' | 'adding' | 'deleting' | 'editing' | 'reordering' | 'selecting' = 'normal';
	let exercise_grid: HTMLDivElement;
	let name_input: string = '';
	let reps_input: string = '';
	let sets_input: string = '';
	let load_input: string = '';

	// Modal variables
	let modalTitle: string;
	let modalTexts: string[];
	let modalOpen = false;

	function are_inputs_valid() {
		let errors: string[] = [];
		if (name_input === '') {
			errors.push('Enter exercise name');
		}
		if (reps_input === '') {
			errors.push('Enter reps value');
		} else if (isNaN(Number(reps_input)) || Number(reps_input) <= 0) {
			errors.push('Reps should be a positive numeric value');
		}
		if (sets_input === '') {
			errors.push('Enter sets value');
		} else if (isNaN(Number(sets_input)) || Number(sets_input) <= 0) {
			errors.push('Sets should be a positive numeric value');
		}
		if (load_input === '') {
			errors.push('Enter load value');
		} else if (isNaN(Number(load_input)) || Number(load_input) <= 0) {
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

	let pre_deletion_exercise_list: Exercise[] = [];
	function delete_entry(id: number) {
		if (pre_deletion_exercise_list.length < exercises.length) {
			pre_deletion_exercise_list = JSON.parse(JSON.stringify(exercises));
		}
		const index_to_remove = exercises.findIndex((exercise) => exercise.id === id);
		if (index_to_remove === -1) {
			return;
		}
		exercises.splice(index_to_remove, 1);
		exercises = exercises;
	}

	function enter_select_mode() {
		mode = 'selecting';
		for (let i = 0; i < exercise_grid.children.length; i++) {
			exercise_grid.children[i].classList.add('animate-pulse');
			exercise_grid.children[i].classList.add('cursor-pointer');
		}
	}

	let selected_entry: HTMLDivElement | undefined;
	function edit_entry(exercise: Exercise) {
		if (mode !== 'selecting') {
			return;
		}
		const entry_to_edit = exercise_grid.children[exercise.id - 1] as HTMLDivElement;
		selected_entry = entry_to_edit;

		for (let i = 0; i < exercise_grid.children.length; i++) {
			exercise_grid.children[i].classList.remove('animate-pulse');
			exercise_grid.children[i].classList.remove('cursor-pointer');
		}

		selected_entry.classList.add('animate-pulse');
		selected_entry.classList.add('border-y-4');
		selected_entry.classList.add('border-accent');
		mode = 'editing';

		name_input = exercise.name;
		reps_input = exercise.reps.toString();
		sets_input = exercise.sets.toString();
		load_input = exercise.sets.toString();
	}

	function enter_reordering_mode() {
		mode = 'reordering';
		// Make all entries draggable
		for (let i = 0; i < exercise_grid.children.length; i++) {
			const entry = exercise_grid.children[i] as HTMLDivElement;
			entry.draggable = true;
		}
	}

	function save_action() {
		if (mode === 'adding') {
			// Inputs must be valid to add to the ExerciseArray
			if (are_inputs_valid() === false) {
				return;
			}
			// Add to the ExerciseArray
			exercises.push({
				id: exercises.length + 1,
				name: name_input,
				reps: Number(reps_input),
				sets: Number(sets_input),
				load: Number(load_input)
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
			pre_deletion_exercise_list = [];
			// Re-assign to reflect in DOM
			exercises = exercises;
		}
		// Nothing was selected and we never entered editing mode
		if (mode === 'selecting') {
			// Remove selecting animations and classes
			for (let i = 0; i < exercise_grid.children.length; i++) {
				exercise_grid.children[i].classList.remove('animate-pulse');
				exercise_grid.children[i].classList.remove('cursor-pointer');
			}
		}
		if (mode === 'editing' && selected_entry) {
			// Inputs must be valid to change the ExerciseArray
			if (are_inputs_valid() === false) {
				return;
			}

			// Remove selected hint classes
			selected_entry.classList.remove('animate-pulse');
			selected_entry.classList.remove('border-y-4');
			selected_entry.classList.remove('border-accent');

			// Get selected entry's ID and modify it's values
			// according to input from user
			const selected_id = Number(selected_entry.children[0].textContent);
			for (let i = 0; i < exercises.length; i++) {
				if (exercises[i].id === selected_id) {
					exercises[i].name = name_input;
					exercises[i].reps = Number(reps_input);
					exercises[i].sets = Number(sets_input);
					exercises[i].load = Number(load_input);
				}
			}
			// Re-assign to reflect in DOM
			exercises = exercises;
			// Clear selected entry to avoid weird behaviour
			selected_entry = undefined;
		}
		if (mode === 'reordering') {
			for (let i = 0; i < exercise_grid.children.length; i++) {
				const entry = exercise_grid.children[i] as HTMLDivElement;
				entry.draggable = false;
			}
		}
		// Reset mode
		mode = 'normal';
	}

	function cancel_action() {
		if (mode === 'deleting') {
			// If something WAS deleted
			if (pre_deletion_exercise_list.length !== 0) {
				// Update the original list
				exercises = JSON.parse(JSON.stringify(pre_deletion_exercise_list));
			}
			// Clear holder variable to avoid weird behaviour
			pre_deletion_exercise_list = [];
		}
		// Nothing was selected and we never entered editing mode
		if (mode === 'selecting') {
			// Remove selecting animations and classes
			for (let i = 0; i < exercise_grid.children.length; i++) {
				exercise_grid.children[i].classList.remove('animate-pulse');
				exercise_grid.children[i].classList.remove('cursor-pointer');
			}
		}
		if (mode === 'editing' && selected_entry) {
			// Remove selected hint classes
			selected_entry.classList.remove('animate-pulse');
			selected_entry.classList.remove('border-y-4');
			selected_entry.classList.remove('border-accent');
			// Clear holder variable to avoid weird behaviour
			selected_entry = undefined;
		}
		if (mode === 'reordering') {
			for (let i = 0; i < exercise_grid.children.length; i++) {
				const entry = exercise_grid.children[i] as HTMLDivElement;
				entry.draggable = false;
			}
		}
		// Reset mode
		mode = 'normal';
	}
</script>

<MyModal modalName="table-modal" {modalTitle} {modalTexts} bind:modalOpen />
<div class="flex flex-col w-full flex-1 rounded-xl my-2.5 bg-primary max-w-xl">
	<h3 class="w-full text-center text-xl font-bold bg-accent text-black rounded-t-xl pt-1 animate">
		{workoutName}
	</h3>
	{#key workoutName}
		<div
			class="flex flex-col gap-1 overflow-y-auto flex-auto h-px my-1.5"
			bind:this={exercise_grid}
		>
			{#each exercises as exercise (exercise.id)}
				<div
					class="flex w-full bg-secondary text-black"
					animate:flip
					in:slide
					on:click={() => edit_entry(exercise)}
					on:drag={() => console.log('dragged')}
				>
					{#if mode === 'deleting'}
						<button
							class="bg-error basis-8 font-semibold hover:brightness-90 active:brightness-75 transition-all"
							on:click={() => delete_entry(exercise.id)}
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
		<div class="flex flex-col w-full items-center gap-6 py-5 bg-base-300" in:fly={{ y: 200 }}>
			<div class="flex flex-col w-1/2">
				<p class="text-center bg-primary rounded-t-lg font-semibold">Name</p>
				<input
					type="text"
					class="input input-xs text-base text-center rounded-t-none text-black bg-secondary"
					bind:value={name_input}
				/>
			</div>
			<div class="grid grid-cols-3 w-full gap-3 place-items-center">
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Reps</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						bind:value={reps_input}
					/>
				</div>
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Sets</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						bind:value={sets_input}
					/>
				</div>
				<div class="flex flex-auto">
					<p class="text-center bg-primary font-semibold rounded-l-lg px-2">Load</p>
					<input
						type="text"
						class="input input-xs text-base text-center rounded-l-none text-black bg-secondary w-16"
						bind:value={load_input}
					/>
				</div>
			</div>
		</div>
	{/if}
	{#if mode === 'normal'}
		<div class="grid grid-cols-4 gap-1">
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-br-none hover:bg-accent hover:brightness-75"
				on:click={() => {
					mode = 'adding';
				}}>ADD</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-none rounded-br-none hover:bg-accent hover:brightness-75"
				on:click={() => {
					mode = 'deleting';
				}}>DELETE</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-none rounded-br-none hover:bg-accent hover:brightness-75"
				on:click={enter_select_mode}>EDIT</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-bl-none hover:bg-accent hover:brightness-75"
				on:click={enter_reordering_mode}>REORDER</button
			>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-1">
			<button
				class="btn btn-sm btn-accent rounded-t-none rounded-br-none hover:brightness-75"
				on:click={save_action}
			>
				{#if mode === 'adding'}
					ADD
				{:else}
					SAVE
				{/if}
			</button>
			<button
				class="btn btn-sm btn-error rounded-t-none rounded-bl-none hover:brightness-75"
				on:click={cancel_action}>CANCEL</button
			>
		</div>
	{/if}
</div>
