<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { getWorkoutVolume } from '$lib/utils/workoutUtils';
	import {
		CategoryScale,
		Chart,
		Filler,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		Tooltip,
		Title
	} from 'chart.js';
	import { onMount } from 'svelte';
	Chart.register(Tooltip, CategoryScale, LineController, LineElement, PointElement, Filler, LinearScale, Title);

	type PropsType = { workoutOfMesocycle: RouterOutputs['workouts']['getTodaysWorkoutData']['workoutOfMesocycle'] };
	let { workoutOfMesocycle }: PropsType = $props();

	let chartCanvas: HTMLCanvasElement | undefined = $state();
	let pastWorkouts: 'loading' | RouterOutputs['mesocycles']['getPastWorkouts'] = $state('loading');

	onMount(async () => {
		if (workoutOfMesocycle === undefined || chartCanvas === undefined) return;

		// TODO: not ideal, should fetch during render, not after...
		pastWorkouts = await trpc().mesocycles.getPastWorkouts.query({
			mesocycleId: workoutOfMesocycle?.mesocycle.id,
			splitDayIndex: workoutOfMesocycle?.splitDayIndex
		});

		const style = getComputedStyle(document.body);
		const primaryColor = style.getPropertyValue('--primary').split(' ').join(', ');
		const secondaryColor = style.getPropertyValue('--secondary').split(' ').join(', ');
		const foregroundColor = style.getPropertyValue('--foreground').split(' ').join(', ');

		new Chart(chartCanvas, {
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
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: 'Work volume',
						font: { weight: 450, size: 14, style: 'normal' },
						color: `hsl(${foregroundColor})`
					}
				}
			}
		});
	});
</script>

{#if workoutOfMesocycle === undefined}
	TODO: no active mesocycle
{:else if pastWorkouts === 'loading'}
	TODO: chart skeleton
{:else}{/if}
<canvas bind:this={chartCanvas} class="h-20"></canvas>
