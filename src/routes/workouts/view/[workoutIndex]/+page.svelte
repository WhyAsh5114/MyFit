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
			<p class="stat-desc">{data.parentMesocycle?.name}</p>
		</div>
	</div>
	<div class="stats bg-primary w-full grid-cols-2 grid">
		<div class="stat">
			<h3>Average RIR</h3>
			<p class="text-secondary font-bold text-2xl">{averageRIR}</p>
		</div>
		<div class="stat">
			<h3>Planned RIR</h3>
			<p class="text-secondary font-bold text-2xl">{data.workout.plannedRIR}</p>
			<p class="stat-desc">{data.workout}</p>
		</div>
	</div>
</div>
<div class="join grid grid-cols-2 w-full">
	<button class="join-item btn btn-error text-black">Delete</button>
	<button class="join-item btn btn-primary">Edit</button>
</div>
