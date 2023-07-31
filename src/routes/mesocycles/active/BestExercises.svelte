<script lang="ts">
	import { getSFR, getSFRColor } from '$lib/commonDB';
	import groupBy from 'lodash/groupBy';

	export let workouts: (Workout | null)[];

	const allExercises: WorkoutExercise[] = [];
	workouts.forEach((workout) => {
		workout?.exercisesPerformed.forEach((exercise) => {
			allExercises.push(exercise);
		});
	});

	type ExerciseSummary = {
		exerciseName: string;
		volumeChange: number;
		loadChange: number;
		perSetVolumeChange: number;
		avgSFR: number;
	};
	const groupedExercises = groupBy(allExercises, (exercise) => exercise.name);
	let exerciseSummaries: ExerciseSummary[] = [];
	for (const [exerciseName, exerciseInstances] of Object.entries(groupedExercises)) {
		const exerciseSummary: ExerciseSummary = {
			exerciseName,
			volumeChange: 0,
			loadChange: 0,
			perSetVolumeChange: 0,
			avgSFR: 0
		};
		const allData: { volumes: number[]; loads: number[]; perSetVolumes: number[]; SFRs: number[] } = {
			volumes: [],
			loads: [],
			perSetVolumes: [],
			SFRs: []
		};

		exerciseInstances.forEach((exercise) => {
			const repsLoadRIR = exercise.repsLoadRIR as [number, number, number][];
			let totalVolume = 0;
			repsLoadRIR.forEach((repLoadRIR) => {
				totalVolume += repLoadRIR[0] * repLoadRIR[1];
				allData.loads.push(repLoadRIR[1]);
			});
			allData.perSetVolumes.push(totalVolume / repsLoadRIR.length);
			allData.volumes.push(totalVolume);
			allData.SFRs.push(getSFR(exercise) ?? 0);
		});

		exerciseSummary.volumeChange = (allData.volumes.at(-1) as number) / allData.volumes[0];
		exerciseSummary.loadChange = (allData.loads.at(-1) as number) / allData.loads[0];
		exerciseSummary.perSetVolumeChange = (allData.perSetVolumes.at(-1) as number) / allData.perSetVolumes[0];
		exerciseSummary.avgSFR = allData.SFRs.reduce((partialSum, SFR) => partialSum + SFR, 0) / allData.SFRs.length;

		exerciseSummaries.push(exerciseSummary);
	}

	let sortBy = 'Volume change';
	$: {
		if (sortBy === 'Volume change') {
			exerciseSummaries.sort((a, b) => {
				return b.volumeChange - a.volumeChange;
			});
		} else if (sortBy === 'Load change') {
			exerciseSummaries.sort((a, b) => {
				return b.loadChange - a.loadChange;
			});
		} else if (sortBy === 'Per set volume change') {
			exerciseSummaries.sort((a, b) => {
				return b.perSetVolumeChange - a.perSetVolumeChange;
			});
		} else if (sortBy === 'Average SFR') {
			exerciseSummaries.sort((a, b) => {
				return b.avgSFR - a.avgSFR;
			});
		}
		exerciseSummaries = exerciseSummaries;
	}

	function changeToColorMap(n: number) {
		if (n < 0.9) return 'text-error';
		if (n < 1.1) return 'text-warning';
		if (n < 1.5) return 'text-success';
		return 'text-accent';
	}
</script>

<div class="stat">
	<h2>Best exercises</h2>
	<div class="h-px bg-white w-full my-2"></div>
	<div class="flex gap-2 items-center">
		<p class="text-sm font-semibold">Sort by</p>
		<select class="select select-sm grow" bind:value={sortBy}>
			<option>Volume change</option>
			<option>Load change</option>
			<option>Per set volume change</option>
			<option>Average SFR</option>
		</select>
	</div>
	<div class="flex flex-col mt-2 text-white">
		{#each exerciseSummaries as exerciseSummary}
			<div class="flex justify-between text-sm">
				<p>{exerciseSummary.exerciseName}</p>
				{#if sortBy === 'Volume change'}
					<p class={changeToColorMap(exerciseSummary.volumeChange)}>
						{Math.round(exerciseSummary.volumeChange * 100) - 100}%
					</p>
				{:else if sortBy === 'Load change'}
					<p class={changeToColorMap(exerciseSummary.loadChange)}>
						{Math.round(exerciseSummary.loadChange * 100) - 100}%
					</p>
				{:else if sortBy === 'Per set volume change'}
					<p class={changeToColorMap(exerciseSummary.perSetVolumeChange)}>
						{Math.round(exerciseSummary.perSetVolumeChange * 100) - 100}%
					</p>
				{:else if sortBy === 'Average SFR'}
					<p class={getSFRColor(exerciseSummary.avgSFR)}>{exerciseSummary.avgSFR.toFixed(2)}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
