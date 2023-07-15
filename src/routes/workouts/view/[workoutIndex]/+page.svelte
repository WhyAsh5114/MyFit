<script lang="ts">
	import { days } from '$lib/commonDB.js';

	export let data;

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

	let muscleTargetsAndSets: Record<string, number> = {};
	$: {
		muscleTargetsAndSets = {};
		data.workout.exercisesPerformed.forEach((exercise) => {
			if (muscleTargetsAndSets[exercise.muscleTarget]) {
				muscleTargetsAndSets[exercise.muscleTarget] += exercise.repsLoadRIR.length;
			} else {
				muscleTargetsAndSets[exercise.muscleTarget] = exercise.repsLoadRIR.length;
			}
		});
	}
</script>

<div class="flex flex-col h-px grow gap-2 w-full overflow-y-auto">
	<div class="stats bg-primary w-full">
		<div class="stat">
			<h3>Workout template</h3>
			<p class="text-secondary font-bold text-2xl">
				{data.parentMesocycle?.splitSchedule[data.workout.dayNumber]} ({days[
					data.workout.dayNumber
				]})
			</p>
			<p class="stat-desc text-sm">{data.parentMesocycle?.name}</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid-cols-2 grid">
		<div class="stat">
			<h3>Average RIR</h3>
			<p class="text-secondary font-bold text-2xl">{averageRIR}</p>
			{#if averageRIR < data.workout.plannedRIR - 0.5}
				<div class="stat-desc text-sm text-error">You went too easy</div>
			{:else if averageRIR > data.workout.plannedRIR + 0.5}
				<div class="stat-desc text-sm text-error">You went too hard</div>
			{:else}
				<div class="stat-desc text-sm">RIR matched with plan</div>
			{/if}
		</div>
		<div class="stat">
			<h3>Planned RIR</h3>
			<p class="text-secondary font-bold text-2xl">{data.workout.plannedRIR}</p>
			<p class="stat-desc text-sm">Week {data.workout.weekNumber}</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid grid-cols-2 place-items-start">
		<div class="stat">
			<h3>Difficulty rating</h3>
			<div class="font-bold text-2xl text-secondary">
				<div class="rating mt-1">
					{#each Array(5).fill(0) as num, i}
						<input
							type="radio"
							name="difficulty-rating"
							value={i + 1}
							class="mask mask-star bg-warning"
							bind:group={data.workout.difficultyRating}
							disabled
						/>
					{/each}
				</div>
			</div>
		</div>
		<div class="stat">
			<h3>Reference workout</h3>
			<p class="text-secondary font-bold text-2xl">
				{#if data.referenceWorkout}
					{data.referenceWorkout.startTimestamp}
				{:else}
					<span class="text-error">Not found</span>
				{/if}
			</p>
		</div>
	</div>
	<div class="stats bg-primary w-full">
		<div class="stat">
			<h3>Muscle targets</h3>
			<div class="flex flex-wrap mt-1.5">
				{#each Object.keys(muscleTargetsAndSets) as muscleTarget}
					<span class="badge">{muscleTarget} x {muscleTargetsAndSets[muscleTarget]}</span>
				{/each}
			</div>
		</div>
	</div>
</div>
<div class="join grid grid-cols-2 w-full">
	<button class="join-item btn btn-error text-black">Delete</button>
	<button class="join-item btn btn-primary">Edit</button>
</div>
