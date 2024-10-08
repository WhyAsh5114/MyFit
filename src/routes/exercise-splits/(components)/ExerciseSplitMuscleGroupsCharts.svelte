<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Chart, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import type { Selected } from 'bits-ui';
	import { convertCamelCaseToNormal } from '$lib/utils';
	import type { SplitExerciseTemplateWithoutIdsOrIndex } from '$lib/components/mesocycleAndExerciseSplit/commonTypes';
	Chart.register(Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale);

	type PropsType = { splitExercises: SplitExerciseTemplateWithoutIdsOrIndex[][] };

	let { splitExercises }: PropsType = $props();
	let chartCanvasElement: HTMLCanvasElement;
	let chart: Chart;

	const muscleGroups = Array.from(
		new Set(
			splitExercises.flatMap((dayExercises) =>
				dayExercises.map((exercise) =>
					exercise.targetMuscleGroup === 'Custom' ? (exercise.customMuscleGroup as string) : exercise.targetMuscleGroup
				)
			)
		)
	);
	const sortedMuscleGroups = muscleGroups.toSorted((a, b) => getTotalExercises(b) - getTotalExercises(a));

	let selectedMuscleGroups: Selected<string>[] = $state(
		sortedMuscleGroups
			.slice(0, 3)
			.map((muscleGroup) => ({ value: muscleGroup, label: convertCamelCaseToNormal(muscleGroup) }))
	);

	let currentFilter: Selected<'Frequency' | 'Exercises'> = $state({
		value: 'Frequency',
		label: 'Frequency'
	});

	function getTotalFrequency(muscleGroup: string) {
		return splitExercises.reduce((totalFrequency, splitDayExercises) => {
			const hasTargetedExercise = splitDayExercises.some((exercise) => exercise.targetMuscleGroup === muscleGroup);
			return totalFrequency + (hasTargetedExercise ? 1 : 0);
		}, 0);
	}

	function getTotalExercises(muscleGroup: string) {
		return splitExercises.reduce((totalExercises, splitDayExercises) => {
			return totalExercises + splitDayExercises.filter((exercise) => exercise.targetMuscleGroup === muscleGroup).length;
		}, 0);
	}

	$effect(() => {
		if (chart) chart.destroy();
		const dataFunction = currentFilter.value == 'Frequency' ? getTotalFrequency : getTotalExercises;
		chart = new Chart(chartCanvasElement, {
			type: 'bar',
			data: {
				labels: selectedMuscleGroups.map((item) => item.label),
				datasets: [
					{
						label: currentFilter.value,
						data: selectedMuscleGroups.map((item) => dataFunction(item.value))
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					y: {
						suggestedMax: Math.round(Math.max(...selectedMuscleGroups.map((item) => dataFunction(item.value))) * 1.5)
					}
				}
			}
		});
	});
</script>

<div class="mb-2 w-full grow">
	<canvas bind:this={chartCanvasElement} id="chart-canvas"></canvas>
</div>

<div class="flex flex-col gap-1">
	<Select.Root bind:selected={currentFilter}>
		<Select.Label class="p-0">Chart type</Select.Label>
		<Select.Trigger class="mb-2 w-full">
			<Select.Value placeholder="Select chart type" />
		</Select.Trigger>
		<Select.Content class="max-h-48 overflow-y-auto">
			{#each ['Frequency', 'Exercises'] as filter}
				<Select.Item value={filter}>{filter}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Select.Root multiple bind:selected={selectedMuscleGroups}>
		<Select.Label class="p-0">Selected muscle groups</Select.Label>
		<Select.Trigger class="w-full">
			<Select.Value placeholder="Select muscle groups" />
		</Select.Trigger>
		<Select.Content class="max-h-48 overflow-y-auto">
			{#each sortedMuscleGroups as muscleGroup}
				<Select.Item value={muscleGroup}>{convertCamelCaseToNormal(muscleGroup)}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
