<script lang="ts">
	import AddExerciseModal from './AddExerciseModal.svelte';
	import SplitExerciseCard from './SplitExerciseCard.svelte';

	export let currentDay: string;
	export let workoutName: string;
	export let splitExercises: SplitExercise[];

	let addExerciseModal: HTMLDialogElement;

	let copiedExercises: SplitExercise[];
	function copyExercises() {
		let todaysExercises = splitExercises;
		if (todaysExercises.length > 0) {
			copiedExercises = JSON.parse(JSON.stringify(todaysExercises));
		}
	}

	function pasteExercises() {
		splitExercises = JSON.parse(JSON.stringify(copiedExercises));
	}

	function clearExercises() {
		splitExercises = [];
	}
</script>

<AddExerciseModal bind:addExerciseModal bind:splitExercises />
<section class="flex flex-col w-full h-full">
	<h2 class="bg-accent text-black text-center text-lg font-semibold rounded-t-lg">
		{workoutName} ({currentDay})
	</h2>
	{#key currentDay}
		<SplitExerciseCard bind:splitExercises />
	{/key}
</section>
<div class="join w-full my-2 grid grid-cols-2 gap-1">
	<div class="join grid grid-cols-3 gap-0.5">
		<button class="btn btn-sm btn-primary join-item" on:click={copyExercises}>Copy</button>
		<button
			on:click={pasteExercises}
			class="btn btn-sm btn-primary join-item disabled:text-opacity-75"
			disabled={copiedExercises ? false : true}>Paste</button
		>
		<button class="btn btn-sm btn-primary join-item" on:click={clearExercises}>Clear</button>
	</div>
	<button class="btn btn-sm btn-accent join-item" on:click={() => addExerciseModal.show()}> Add Exercise </button>
</div>
