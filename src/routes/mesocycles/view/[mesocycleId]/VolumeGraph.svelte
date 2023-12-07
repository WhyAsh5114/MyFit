<script lang="ts">
	import Chart from "chart.js/auto";
	import { onMount } from "svelte";
	import { addAlpha } from "$lib/util/CommonFunctions";
	import { getTotalVolume } from "$lib/util/ProgressiveOverload";
	export let workouts: (Workout | null)[];
	export let exerciseSplit: MesocycleTemplate["exerciseSplit"];

	Chart.defaults.color = "#f4f4f4";
	workouts.reverse();

	type DataEntry = { startTimestamp: EpochTimeStamp; dayNumber: number; sets: number; volume: 0 };

	const data: DataEntry[] = [];
	workouts.forEach((workout) => {
		if (workout === null) return;
		let dataEntry: DataEntry = { ...workout, sets: 0, volume: 0 };
		workout.exercisesPerformed.forEach((exercise) => {
			dataEntry.sets += exercise.sets.length;
			dataEntry.volume += getTotalVolume(exercise.bodyweight, exercise.sets);
		});
		data.push(dataEntry);
	});

	let canvasElement: HTMLCanvasElement;
	onMount(() => {
		new Chart(canvasElement, {
			type: "bar",
			data: {
				labels: data.map(
					({ startTimestamp, dayNumber }) =>
						`${exerciseSplit[dayNumber]?.name} (${new Date(startTimestamp).toLocaleDateString(
							"en-US",
							{
								day: "2-digit",
								month: "short"
							}
						)})`
				),
				datasets: [
					{
						type: "line",
						label: "Volume",
						data: data.map((entry) => entry.volume),
						backgroundColor: "#ff0000",
						borderColor: "#000000",
						yAxisID: "volumeScale"
					},
					{
						label: "Sets performed",
						data: data.map((entry) => entry.sets),
						backgroundColor: addAlpha("#30c9b5", 0.75),
						yAxisID: "setsScale"
					}
				]
			},
			options: {
				scales: {
					x: {
						stacked: false
					},
					setsScale: {
						position: "left",
					},
					volumeScale: {
						position: "right",
                        grid: {
                            drawOnChartArea: false
                        }
					}
				}
			}
		});
	});
</script>

<canvas bind:this={canvasElement} class="max-h-56"></canvas>
