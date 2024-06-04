<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import { SetType, type ExerciseTemplate } from '@prisma/client';
	import { type Selected } from 'bits-ui';
	import {
		ArcElement,
		CategoryScale,
		Chart,
		DoughnutController,
		Legend,
		LinearScale,
		PolarAreaController,
		RadialLinearScale,
		Tooltip,
		LineController,
		PointElement,
		LineElement,
		Filler
	} from 'chart.js';
	Chart.register(
		Tooltip,
		Legend,
		DoughnutController,
		CategoryScale,
		LinearScale,
		ArcElement,
		PolarAreaController,
		RadialLinearScale,
		LineController,
		PointElement,
		LineElement,
		Filler
	);

	let { exercises }: { exercises: ExerciseTemplate[] } = $props();
	const chartTypes = ['Bodyweight & Weighted', 'Rep ranges', 'Set types'];

	let chart:
		| Chart<'doughnut', number[], string>
		| Chart<'polarArea', number[], string>
		| Chart<'line', number[], number>;
	let chartCanvas: HTMLCanvasElement;
	let selectedChartType: Selected<string> = $state({ value: chartTypes[1], label: chartTypes[1] });

	$effect(() => {
		const style = getComputedStyle(document.body);
		const primaryColor = style.getPropertyValue('--primary').split(' ').join(', ');
		const secondaryColor = style.getPropertyValue('--secondary').split(' ').join(', ');
		const mutedForegroundColor = style.getPropertyValue('--muted-foreground').split(' ').join(', ');

		if (chart) chart.destroy();
		if (selectedChartType.value === chartTypes[0]) {
			const bodyweightExercises = exercises.filter(
				(exercise) => exercise.involvesBodyweight
			).length;
			chart = new Chart(chartCanvas, {
				type: 'doughnut',
				data: {
					labels: ['Weighted', 'Bodyweight'],
					datasets: [
						{
							data: [exercises.length - bodyweightExercises, bodyweightExercises],
							backgroundColor: [`hsl(${primaryColor})`, `hsl(${secondaryColor})`],
							borderWidth: 0
						}
					]
				}
			});
		} else if (selectedChartType.value === chartTypes[1]) {
			const hashmap: Map<number, number> = new Map();
			exercises.forEach((exercise) => {
				for (let i = exercise.repRangeStart; i <= exercise.repRangeEnd; i++) {
					hashmap.set(i, (hashmap.get(i) ?? 0) + 1);
				}
			});
			const data = Array.from(hashmap, ([rep, value]) => ({ rep, value }));
			console.log(data);
			// TODO: make good repRanges chart
			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: data.map((entry) => entry.rep),
					datasets: [
						{
							data: [2, 3, 2],
							fill: {
								target: 'origin',
								above: `hsl(${secondaryColor})`
							},
							borderWidth: 0,
							pointBorderWidth: 0
						}
					]
				},
				options: { plugins: { legend: { display: false } } }
			});
		} else {
			const setTypes = Object.keys(SetType);
			const data = setTypes.map(
				(setType) => exercises.filter((exercise) => exercise.setType === setType).length
			);
			chart = new Chart(chartCanvas, {
				type: 'polarArea',
				data: {
					labels: setTypes.map((setType) => convertCamelCaseToNormal(setType)),
					datasets: [
						{
							data,
							backgroundColor: [`hsl(${primaryColor})`, `hsl(${secondaryColor})`],
							borderWidth: 0
						}
					]
				},
				options: {
					scales: {
						r: {
							ticks: {
								color: `hsl(${mutedForegroundColor})`,
								backdropColor: 'rgba(0, 0, 0, 0)'
							}
						}
					}
				}
			});
		}
	});
</script>

<Select.Root bind:selected={selectedChartType}>
	<Select.Label class="mb-0.5 p-0">View chart</Select.Label>
	<Select.Trigger class="w-full">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each chartTypes as chartType}
			<Select.Item value={chartType}>{chartType}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>

<canvas bind:this={chartCanvas} class="my-4"></canvas>
