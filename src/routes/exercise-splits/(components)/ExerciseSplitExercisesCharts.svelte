<script lang="ts">
	import type { SplitExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
	import * as Select from '$lib/components/ui/select';
	import { cn, convertCamelCaseToNormal } from '$lib/utils';
	import { SetType } from '@prisma/client';
	import type { Selected } from 'bits-ui';
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

	type PropsType = { exercises: SplitExerciseTemplateWithoutIdsOrIndex[] };

	let { exercises }: PropsType = $props();
	const chartTypes = ['Bodyweight & weighted', 'Rep ranges', 'Set types'];

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
			const maxReps = Math.max(...exercises.map((exercise) => exercise.repRangeEnd));
			const data = Array(maxReps + 1).fill(0);
			exercises.forEach((exercise) => {
				for (let i = exercise.repRangeStart; i < exercise.repRangeEnd; i++) data[i]++;
			});
			chart = new Chart(chartCanvas, {
				type: 'line',
				data: {
					labels: data.map((_, idx) => idx),
					datasets: [
						{
							data,
							fill: {
								target: 'origin',
								above: `hsl(${primaryColor})`
							},
							borderWidth: 0,
							pointBorderWidth: 0
						}
					]
				},
				options: { plugins: { legend: { display: false } }, elements: { point: { radius: 0 } } }
			});
		} else {
			const setTypes = Object.values(SetType);
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
	<Select.Label class="mb-0.5 p-0">Chart type</Select.Label>
	<Select.Trigger class="w-full">
		<Select.Value />
	</Select.Trigger>
	<Select.Content>
		{#each chartTypes as chartType}
			<Select.Item value={chartType}>{chartType}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>

<canvas
	bind:this={chartCanvas}
	class={cn('my-4 max-h-96', { 'max-h-56': selectedChartType.value === 'Bodyweight & weighted' })}
></canvas>
