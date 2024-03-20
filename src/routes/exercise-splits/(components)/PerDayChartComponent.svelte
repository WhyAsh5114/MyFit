<script lang="ts">
	import { Bar } from 'svelte-chartjs';
	import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
	export let splitDays: ExerciseSplit['splitDays'];
	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	const data = {
		labels: splitDays.map((_, idx) => `D${idx + 1}`),
		datasets: [
			{
				label: 'Volume',
				data: splitDays.map((splitDay, idx) => {
					if (!splitDay) return 0;
					return splitDay.exerciseTemplates.reduce((totalSets, exercise) => {
						return totalSets + exercise.sets;
					}, 0);
				}),
				backgroundColor: '#3079ca',
				borderWidth: 2,
				borderColor: '#3079ca'
			}
		]
	};
</script>

<Bar {data} />
