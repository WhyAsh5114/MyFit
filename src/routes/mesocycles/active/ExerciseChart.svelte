<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import { days, getSFR } from '$lib/commonDB';
	import groupBy from 'lodash/groupBy';

	export let workouts: (Workout | null)[];
	let chartCanvas: HTMLCanvasElement;
	let chartCanvas2: HTMLCanvasElement;

	function dayAndMonth(timestamp: number) {
		const date = new Date(timestamp);
		return date.getUTCDate() + '/' + (date.getUTCMonth() + 1);
	}

	function getAvgExerciseData(repsLoadRIR: WorkoutExercise['repsLoadRIR']) {
		let avgReps = 0;
		let avgLoad = 0;
		let volume = 0;
		repsLoadRIR.forEach((repLoadRIR) => {
			if (repLoadRIR[0]) {
				avgReps += repLoadRIR[0];
			}
			if (repLoadRIR[1]) {
				avgLoad += repLoadRIR[1];
			}
			if (repLoadRIR[0] && repLoadRIR[1]) {
				volume += repLoadRIR[0] * repLoadRIR[1];
			}
		});
		avgReps /= repsLoadRIR.length;
		avgLoad /= repsLoadRIR.length;

		return { reps: avgReps, load: avgLoad, volume };
	}

	const workoutsByDayNumber = groupBy(workouts, (workout) => workout?.dayNumber);
	const exercisesByDayNumber: Record<number, Set<string>> = {
		0: new Set(),
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set(),
		5: new Set(),
		6: new Set()
	};
	for (const [dayNumber, workouts] of Object.entries(workoutsByDayNumber)) {
		workouts.forEach((workout) => {
			if (!workout) return;
			workout.exercisesPerformed.forEach((exercise) => {
				exercisesByDayNumber[parseInt(dayNumber)].add(exercise.name);
			});
		});
	}

	interface ExerciseWithDate extends WorkoutExercise {
		startTimestamp: EpochTimeStamp;
		dayNumber: number;
	}
	const allExercises: ExerciseWithDate[] = [];
	workouts.forEach((workout) => {
		workout?.exercisesPerformed.forEach((exercise) => {
			allExercises.push({ ...exercise, startTimestamp: workout.startTimestamp, dayNumber: workout.dayNumber });
		});
	});
	const groupedExercises = groupBy(allExercises, (exercise) => exercise.name);

	let selectedDay: number;
	let selectedExercise: string;

	Chart.defaults.color = '#ffffff';
	let chart: Chart;
	let chart2: Chart;
	onMount(() => {
		chart = new Chart(chartCanvas, {
			data: {
				datasets: []
			},
			options: {
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left'
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						grid: {
							drawOnChartArea: false // only want the grid lines for one axis to show up
						},
						ticks: {
							// Include kg in the ticks
							callback: (value, index, ticks) => {
								return value + 'kg';
							}
						}
					}
				}
			}
		});
		chart2 = new Chart(chartCanvas2, {
			data: {
				datasets: []
			},
			options: {
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						min: 0
					},
					y1: {
						type: 'linear',
						display: false,
						position: 'right',
						grid: {
							drawOnChartArea: false // only want the grid lines for one axis to show up
						}
					}
				}
			}
		});
	});
	$: if (chartCanvas && selectedExercise) {
		const data: { timestamp: number; reps: number; load: number; volume: number }[] = [];
		let exerciseInstances = groupedExercises[selectedExercise];
		if (weekWise) {
			exerciseInstances = exerciseInstances.filter((exercise) => exercise.dayNumber === selectedDay);
		}
		exerciseInstances.forEach((exercise) => {
			data.push({ timestamp: exercise.startTimestamp, ...getAvgExerciseData(exercise.repsLoadRIR) });
		});
		chart.data.labels = data.map((row) => dayAndMonth(row.timestamp));
		chart.data.datasets[0] = {
			type: 'line',
			label: 'Reps',
			data: data.map((row) => row.reps),
			backgroundColor: '#ffc300',
			borderColor: '#000000',
			yAxisID: 'y'
		};
		chart.data.datasets[1] = {
			type: 'line',
			label: 'Load',
			data: data.map((row) => row.load),
			backgroundColor: '#00ff15',
			borderColor: '#000000',
			yAxisID: 'y1'
		};
		chart.update();
		chart2.data.labels = data.map((row) => dayAndMonth(row.timestamp));
		chart2.data.datasets[0] = {
			type: 'bar',
			label: 'Sets',
			data: exerciseInstances.map((exercise) => exercise.repsLoadRIR.length),
			backgroundColor: '#ff474775',
			order: 2
		};
		chart2.data.datasets[1] = {
			type: 'line',
			label: 'SFR',
			data: exerciseInstances.map((exercise) => {
				return getSFR(exercise) ?? 0;
			}),
			backgroundColor: '#30c9b5',
			borderColor: '#000000',
			order: 1
		};

		const volumes = exerciseInstances.map((exercise) => {
			return exercise.repsLoadRIR.reduce((totalVolume, repLoadRIR) => {
				if (repLoadRIR[0] && repLoadRIR[1]) {
					return totalVolume + repLoadRIR[0] * repLoadRIR[1];
				}
				return totalVolume;
			}, 0) as number;
		});
		chart2.data.datasets[2] = {
			type: 'line',
			label: 'Volume',
			data: volumes,
			backgroundColor: '#ff0000',
			borderColor: '#000000',
			order: 1,
			yAxisID: 'y1'
		};
		chart2.update();
	}

	let weekWise = true;
</script>

<div class="stat">
	<h2>Exercise progression</h2>
	<div class="h-px bg-white w-full my-2"></div>
	<div class="flex justify-between gap-2 items-center">
		<select class="select select-sm mt-2" bind:value={selectedDay}>
			{#each days as day, i}
				<option value={i}>{day}</option>
			{/each}
		</select>
		<div class="flex gap-2">
			<p class="text-sm">Week wise</p>
			<input type="checkbox" class="toggle" bind:checked={weekWise} />
		</div>
	</div>
	{#if exercisesByDayNumber[selectedDay]}
		<select class="select select-sm mt-2" bind:value={selectedExercise}>
			{#each exercisesByDayNumber[selectedDay] as exerciseName}
				<option>{exerciseName}</option>
			{/each}
		</select>
	{/if}
	<canvas bind:this={chartCanvas}></canvas>
	<canvas bind:this={chartCanvas2}></canvas>
</div>
