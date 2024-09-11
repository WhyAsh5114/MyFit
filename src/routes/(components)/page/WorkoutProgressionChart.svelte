<script lang="ts">
	import type { RouterOutputs } from '$lib/trpc/router';
	import { getWorkoutVolume } from '$lib/utils/workoutUtils';
	import {
		CategoryScale,
		Chart,
		Filler,
		Legend,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		Title,
		Tooltip
	} from 'chart.js';
	Chart.register(Tooltip, CategoryScale, LineController, LineElement, PointElement, Filler, LinearScale, Title, Legend);

	type PropsType = { pastWorkouts: RouterOutputs['mesocycles']['getWorkouts'] };
	let { pastWorkouts }: PropsType = $props();

	let chart: Chart;
	let chartCanvas: HTMLCanvasElement | undefined = $state();

	$effect(() => {
		if (chartCanvas === undefined) return;
		if (chart) chart.destroy();

		const style = getComputedStyle(document.body);
		const primaryColor = style.getPropertyValue('--primary').split(' ').join(', ');
		const secondaryColor = style.getPropertyValue('--secondary').split(' ').join(', ');

		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: pastWorkouts.map((workout) =>
					new Date(workout.startedAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
				),
				datasets: [
					{
						data: pastWorkouts.map((workout) => getWorkoutVolume(workout)),
						fill: {
							target: 'origin',
							above: `hsl(${secondaryColor})`
						},
						borderColor: `hsl(${primaryColor})`,
						borderWidth: 1,
						label: 'Work volume'
					}
				]
			}
		});
	});
</script>

<canvas bind:this={chartCanvas} height="160"></canvas>
