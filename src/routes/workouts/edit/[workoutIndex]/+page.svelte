<script lang="ts">
	import { dateFormatter, days } from '$lib/commonDB.js';
	import WorkoutExerciseCard from '$lib/components/workout/WorkoutExerciseCard.svelte';
	export let data;

	let setsPerformedPerExercise: boolean[][] = [];
	data.workout.exercisesPerformed.forEach((exercise) => {
		setsPerformedPerExercise.push(Array(exercise.repsLoadRIR.length).fill(true));
	});

	let totalSets = 0;
	$: {
		totalSets = 0;
		data.workout.exercisesPerformed.forEach((exercise) => {
			totalSets += exercise.repsLoadRIR.length;
		});
	}

	let averageRIR = 0;
	$: {
		averageRIR = 0;
		data.workout.exercisesPerformed.forEach((exercise) => {
			exercise.repsLoadRIR.forEach((repLoadRIR) => {
				averageRIR += repLoadRIR[2];
			});
		});
		averageRIR = Math.round((averageRIR / totalSets) * 100) / 100;
	}
</script>

<div class="flex flex-col h-px grow gap-2 w-full overflow-y-auto">
	<div class="stats bg-primary w-full stats-vertical shrink-0">
		<div class="stat">
			<h3>Template</h3>
			<p class="text-secondary font-bold text-xl">
				{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[data.workout.dayNumber]})
			</p>
			<p class=" text-sm">{data.parentMesocycle?.name}</p>
		</div>
		<div class="stat">
			<h3>Date</h3>
			<p class="text-secondary font-bold text-xl">
				{dateFormatter(data.workout.startTimestamp)}
			</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid-cols-2 grid shrink-0">
		<div class="stat">
			<h3>Average RIR</h3>
			<p class="text-secondary font-bold text-2xl">{averageRIR}</p>
			{#if averageRIR < data.workout.plannedRIR - 0.5}
				<div class=" text-sm text-error">You went too hard</div>
			{:else if averageRIR > data.workout.plannedRIR + 0.5}
				<div class=" text-sm text-error">You went too easy</div>
			{:else}
				<div class=" text-sm">Matched with plan</div>
			{/if}
		</div>
		<div class="stat">
			<h3>Planned RIR</h3>
			<p class="text-secondary font-bold text-2xl">{data.workout.plannedRIR}</p>
			<p class=" text-sm">Week {data.workout.weekNumber}</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid grid-cols-2 place-items-start shrink-0">
		<div class="stat">
			<h3 id="diff-rating-heading">Difficulty rating</h3>
			<div class="font-bold text-2xl text-secondary">
				<div class="rating mt-1">
					{#each Array(5).fill(0) as num, i}
						<input
							type="radio"
							name="difficulty-rating"
							value={i + 1}
							class="mask mask-star bg-warning"
							bind:group={data.workout.difficultyRating}
							aria-labelledby="diff-rating-heading"
						/>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<WorkoutExerciseCard
		bind:workoutExercises={data.workout.exercisesPerformed}
		bind:setsPerformedPerExercise
		bind:musclesTargetedPreviously={data.musclesTargetedPreviously}
	/>
</div>
<div class="join grid grid-cols-2 w-full">
	<button class="join-item btn btn-primary">Cancel</button>
	<button class="join-item btn btn-accent">Save</button>
</div>
