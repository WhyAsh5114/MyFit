<script lang="ts">
	import MyModal from "./MyModal.svelte";

	export let workoutName: string;
	export let exercises: Exercise[];

	let mode: 'normal' | 'adding' | 'deleting' | 'editing' | 'reordering' = 'normal';
	let name_input: string = '';
	let reps_input: string = '';
	let sets_input: string = '';
	let load_input: string = '';

	let modalTitle: string;
	let modalTexts: string[];
	let modalOpen = false;

	function are_inputs_valid() {
		let errors: string[] = [];
		if (name_input === '') {
			errors.push("Enter exercise name");
		}
		if (reps_input === '') {
			errors.push("Enter reps value");
		} else if (isNaN(Number(reps_input) )|| Number(reps_input) <= 0) {
			errors.push("Reps should be a positive numeric value");
		}
		if (sets_input === '') {
			errors.push("Enter sets value");
		} else if (isNaN(Number(sets_input)) || Number(sets_input) <= 0) {
			errors.push("Sets should be a positive numeric value");
		}
		if (load_input === '') {
			errors.push("Enter load value");
		} else if (isNaN(Number(load_input)) || Number(load_input) <= 0) {
			errors.push("Load should be a positive numeric value");
		}		

		if (errors.length > 0) {
			modalTitle = 'Error';
			modalTexts = errors;
			modalOpen = true;
			return false;
		}
		return true;
	}

	function save_action() {
		if (mode === "adding") {
			if (are_inputs_valid() === false) {
				return;
			}
			exercises.push({
				id: exercises.length + 1,
				name: name_input,
				reps: Number(reps_input),
				sets: Number(sets_input),
				load: Number(load_input)
			});
			exercises = exercises;
		}
		mode = 'normal';
	}

	function cancel_action() {
		mode = 'normal';
	}
</script>

<MyModal {modalTitle} {modalTexts} bind:modalOpen />
<div class="flex flex-col w-full flex-1 rounded-xl my-2.5 bg-primary max-w-xl">
	<h3 class="w-full text-center text-xl font-bold bg-accent text-black rounded-t-xl pt-1">
		{workoutName}
	</h3>
	<div class="flex flex-col gap-1 overflow-y-auto flex-auto h-px my-1.5">
		{#each exercises as exercise}
			<div class="flex w-full bg-secondary text-black">
				<p class="basis-8 text-center border-r border-black">{exercise.id}</p>
				<p class="flex-grow text-center border-x border-black">{exercise.name}</p>
				<p class="basis-8 text-center border-x border-black">{exercise.reps}</p>
				<p class="basis-8 text-center border-x border-black">{exercise.sets}</p>
				<p class="basis-8 text-center border-l border-black">{exercise.load}</p>
			</div>
		{/each}
	</div>
	{#if ['adding', 'editing'].includes(mode)}
		<div class="flex flex-col w-full items-center gap-6 py-5 bg-base-300">
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
				on:click={() => {
					mode = 'editing';
				}}>EDIT</button
			>
			<button
				class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-bl-none hover:bg-accent hover:brightness-75"
				on:click={() => {
					mode = 'reordering';
				}}>REORDER</button
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
