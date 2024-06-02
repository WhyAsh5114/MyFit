<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExerciseTemplateRuneType } from '../../exerciseSplitRunes.svelte';
	import {
		Chart,
		Tooltip,
		Legend,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale
	} from 'chart.js';
	Chart.register(Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale);

	let { splitExercises }: { splitExercises: ExerciseTemplateRuneType[][] } = $props();
	const data = splitExercises.map((splitDayExercises, idx) => {
		return {
			day: `D${idx + 1}`,
			totalVolume: splitDayExercises.reduce((totalVolume, exercise) => {
				return totalVolume + exercise.sets;
			}, 0)
		};
	});

	let perDayChart: HTMLCanvasElement;
	onMount(() => {
		new Chart(perDayChart, {
			type: 'bar',
			data: {
				labels: data.map((row) => row.day),
				datasets: [{ label: 'Volume', data: data.map((row) => row.totalVolume) }]
			},
			options: {
				layout: { padding: { top: 12 } },
				maintainAspectRatio: false,
				scales: {
					y: { suggestedMax: Math.round(Math.max(...data.map((row) => row.totalVolume)) * 1.1) }
				}
			}
		});
	});
</script>

<div class="h-full w-full">
	<canvas bind:this={perDayChart} id="per-day-chart"></canvas>
</div>
