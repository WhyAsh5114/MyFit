<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import { commonMuscleGroups } from '$lib/commonDB';

	export let weeklyWorkoutData: WorkoutDataByWeek[];
	let chartCanvas: HTMLCanvasElement;

	let data: { week: number; sets: number }[] = [];
	for (let i = 1; i <= weeklyWorkoutData.length; i++) {
		data.push({ week: i, sets: 0 });
	}

	let selectedMuscleGroup: (typeof commonMuscleGroups)[number] | undefined = undefined;
	$: {
		weeklyWorkoutData.forEach((weekWorkoutData) => {
			const weekRow = data.find((row) => row.week === weekWorkoutData.week);
			if (!weekRow) return;

			if (selectedMuscleGroup) {
				const muscleGroupData = weekWorkoutData.allMuscleGroupData.find(
					(muscleGroupData) => muscleGroupData.muscleGroup === selectedMuscleGroup
				) as MuscleGroupData;
				weekRow.sets = muscleGroupData.volume;
			} else {
				weekRow.sets = 0;
				weekWorkoutData.allMuscleGroupData.forEach((muscleGroupData) => {
					weekRow.sets += muscleGroupData.volume;
				});
			}
		});
		if (chart) {
			chart.data.datasets[0].data = data.map((row) => row.sets);
			if (selectedMuscleGroup) {
			}
			chart.update();
		}
	}

	Chart.defaults.color = '#ffffff';
	let chart: Chart;
	onMount(() => {
		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: data.map((row) => 'Week ' + row.week),
				datasets: [
					{
						label: 'Weekly volume (sets)',
						data: data.map((row) => row.sets),
						backgroundColor: '#ff0000',
						borderColor: '#000000'
					}
				]
			}
		});
	});
</script>

<div class="stat">
	<h2>Volume progression</h2>
	<div class="h-px bg-white w-full my-2"></div>
	<select class="select select-sm mt-2" bind:value={selectedMuscleGroup}>
		<option value={undefined}>All muscle groups</option>
		{#each commonMuscleGroups as muscleGroup}
			<option>{muscleGroup}</option>
		{/each}
	</select>
	<canvas bind:this={chartCanvas}></canvas>
</div>
