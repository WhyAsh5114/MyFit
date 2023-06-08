<script lang="ts">
	import type { SplitExercise } from '$lib/global';
	import SplitExerciseCard from './SplitExerciseCard.svelte';
	import { fly } from 'svelte/transition';

	export let currentDay: string;
	export let workoutName: string;
	export let splitExercises: SplitExercise[];
	export let editExercise: (i: number, exercise: SplitExercise) => void;
	export let deleteExercise: (i: number) => void;
</script>

<section class="flex flex-col w-full h-full">
	<h4 class="bg-accent text-black text-center text-lg font-semibold rounded-t-lg">
		{workoutName} ({currentDay})
	</h4>
	{#key currentDay}
		<ul
			class="flex flex-col h-px grow bg-primary rounded-b-lg p-2 gap-3 overflow-y-auto"
			in:fly={{ duration: 200, y: 10, opacity: 0 }}
		>
			<SplitExerciseCard bind:splitExercises bind:editExercise bind:deleteExercise />
		</ul>
	{/key}
</section>
