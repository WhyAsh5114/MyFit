<script lang="ts">
	import { onMount } from 'svelte';
	import * as Select from '$lib/components/ui/select';
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
	import { MuscleGroup } from '@prisma/client';
	import type { Selected } from 'bits-ui';
	Chart.register(Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale);

	let { splitExercises }: { splitExercises: ExerciseTemplateRuneType[][] } = $props();
	let perDayChartCanvasElement: HTMLCanvasElement;
	let perDayChart: Chart;

	const muscleGroups = Object.keys(MuscleGroup) as MuscleGroup[];
	const sortedMuscleGroups = muscleGroups.toSorted((a, b) => getTotalVolume(b) - getTotalVolume(a));

	let selectedMuscleGroups: Selected<MuscleGroup>[] = $state(
		sortedMuscleGroups
			.slice(0, 3)
			.map((muscleGroup) => ({ value: muscleGroup, label: muscleGroup }))
	);

	function getTotalVolume(muscleGroup: MuscleGroup) {
		return splitExercises.reduce((totalSets, splitDayExercises) => {
			return (
				totalSets +
				splitDayExercises.reduce(
					(setsForDay, exercise) =>
						exercise.targetMuscleGroup === muscleGroup ? setsForDay + exercise.sets : setsForDay,
					0
				)
			);
		}, 0);
	}

	onMount(() => {
		perDayChart = new Chart(perDayChartCanvasElement, {
			type: 'bar',
			data: {
				labels: selectedMuscleGroups.map((item) => item.label),
				datasets: [
					{
						label: 'Volume',
						data: selectedMuscleGroups.map((item) => getTotalVolume(item.value))
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					y: {
						suggestedMax: Math.round(
							Math.max(...selectedMuscleGroups.map((item) => getTotalVolume(item.value))) * 1.1
						)
					}
				}
			}
		});
	});

	$effect(() => {
		perDayChart.data = {
			labels: selectedMuscleGroups.map((item) => item.label),
			datasets: [
				{
					label: 'Volume',
					data: selectedMuscleGroups.map((item) => getTotalVolume(item.value))
				}
			]
		};
		perDayChart.update();
	});
</script>

<div class="mb-2 w-full grow">
	<canvas bind:this={perDayChartCanvasElement} id="per-day-chart"></canvas>
</div>

<div class="flex flex-col gap-1">
	<Select.Root multiple bind:selected={selectedMuscleGroups}>
		<Select.Label class="p-0">Selected muscle groups</Select.Label>
		<Select.Trigger class="w-full">
			<Select.Value placeholder="Select muscle groups" />
		</Select.Trigger>
		<Select.Content class="max-h-48 overflow-y-auto">
			{#each Object.keys(MuscleGroup) as muscleGroup}
				<Select.Item value={muscleGroup}>{muscleGroup}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
