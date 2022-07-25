<script lang="ts">
	export let workoutName: string;
	export let exercises: Exercise[];
</script>

<div class="flex flex-col w-full h-full rounded-xl mt-2.5 bg-primary gap-1.5 max-w-md">
	<h3
		class="w-full uppercase text-center text-xl font-bold bg-accent text-black rounded-t-xl pt-1"
	>
		{workoutName}
	</h3>
    <!-- No idea why flex-auto and h-96 works, fix later maybe -->
	<div class="flex flex-col gap-1 overflow-y-auto flex-auto h-96">
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
	<div class="grid grid-cols-4 gap-1">
		<button class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-br-none">ADD</button>
		<button class="btn btn-sm bg-accent text-black flex-grow rounded-none">DELETE</button>
		<button class="btn btn-sm bg-accent text-black flex-grow rounded-none">EDIT</button>
		<button class="btn btn-sm bg-accent text-black flex-grow rounded-t-none rounded-bl-none">MOVE</button>
	</div>
</div>
