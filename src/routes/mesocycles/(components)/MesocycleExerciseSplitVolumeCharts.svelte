<script lang="ts">
	import type { MesocycleExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
	import * as Select from '$lib/components/ui/select';
	import { arraySum, convertCamelCaseToNormal } from '$lib/utils';
	import type { Selected } from 'bits-ui';
	import {
		ArcElement,
		BarController,
		BarElement,
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		PieController,
		Tooltip
	} from 'chart.js';
	Chart.register(Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, PieController, ArcElement);

	type PropsType = { mesocycleSplitExercises: MesocycleExerciseTemplateWithoutIdsOrIndex[][] };

	let { mesocycleSplitExercises }: PropsType = $props();
	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	const muscleGroups = Array.from(
		new Set(
			mesocycleSplitExercises
				.flat()
				.map((exercise) =>
					exercise.targetMuscleGroup === 'Custom' ? (exercise.customMuscleGroup as string) : exercise.targetMuscleGroup
				)
		)
	);
	let selectedMuscleGroups: Selected<string>[] = $state(
		muscleGroups
			.slice(0, 3)
			.map((muscleGroup) => ({ value: muscleGroup, label: convertCamelCaseToNormal(muscleGroup) }))
	);

	const chartTypes = ['Microcycle volume distribution', 'Muscle group volume distribution'] as const;
	let selectedChartType: Selected<(typeof chartTypes)[number]> = $state({
		value: 'Microcycle volume distribution',
		label: 'Microcycle volume distribution'
	});

	$effect(() => {
		const style = getComputedStyle(document.body);
		const primaryColor = style.getPropertyValue('--primary').split(' ').join(', ');
		const secondaryColor = style.getPropertyValue('--secondary').split(' ').join(', ');

		if (chart) chart.destroy();
		if (selectedChartType.value === 'Microcycle volume distribution') {
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: mesocycleSplitExercises.map((_, idx) => `D${idx + 1}`),
					datasets: [
						{
							label: 'Volume',
							data: mesocycleSplitExercises.map((dayExercises) =>
								arraySum(dayExercises.map((exercise) => exercise.sets))
							)
						}
					]
				}
			});
		} else if (selectedChartType.value === 'Muscle group volume distribution') {
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: mesocycleSplitExercises.map((_, idx) => `D${idx + 1}`),
					datasets: selectedMuscleGroups.map(({ value }, idx) => ({
						label: value,
						data: mesocycleSplitExercises.map((dayExercises) =>
							arraySum(
								dayExercises
									.filter((e) => (e.customMuscleGroup ?? e.targetMuscleGroup) === value)
									.map((exercise) => exercise.sets)
							)
						),
						backgroundColor: idx % 2 === 0 ? `hsl(${primaryColor})` : `hsl(${secondaryColor})`
					}))
				}
			});
		}
	});
</script>

<div class="mb-2 w-full grow">
	<canvas bind:this={chartCanvas} id="chart-canvas"></canvas>
</div>

<div class="flex flex-col gap-1">
	<Select.Root bind:selected={selectedChartType}>
		<Select.Label class="p-0">Chart</Select.Label>
		<Select.Trigger class="mb-2 w-full">
			<Select.Value placeholder="Select chart" />
		</Select.Trigger>
		<Select.Content class="max-h-48 overflow-y-auto">
			{#each chartTypes as chartType}
				<Select.Item value={chartType}>{chartType}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if selectedChartType.value === 'Muscle group volume distribution'}
		<Select.Root multiple bind:selected={selectedMuscleGroups}>
			<Select.Label class="p-0">Selected muscle groups</Select.Label>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select muscle groups" />
			</Select.Trigger>
			<Select.Content class="max-h-48 overflow-y-auto">
				{#each muscleGroups as muscleGroup}
					<Select.Item value={muscleGroup}>{convertCamelCaseToNormal(muscleGroup)}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
</div>
