<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from 'chart.js';

	export let splitDays: ExerciseSplit['splitDays'];
	export let selectedMuscleGroups: MuscleGroup[];
	$: selectedMuscleGroups, (data = generateData());

	function generateData() {
		const shadesAndTints = generateShadesAndTints('3079ca', selectedMuscleGroups.length);
		return {
			labels: splitDays.map((_, idx) => `D${idx + 1}`),
			datasets: selectedMuscleGroups.map((muscleGroup, idx) => {
				return {
					label: muscleGroup,
					lineTension: 0.3,
					borderColor: shadesAndTints[idx],
					pointBackgroundColor: shadesAndTints[idx],
					data: splitDays.map((splitDay) => {
						if (!splitDay) return 0;
						return splitDay.exerciseTemplates.reduce((totalSets, exercise) => {
							return exercise.targetMuscleGroup === muscleGroup
								? totalSets + exercise.sets
								: totalSets;
						}, 0);
					})
				};
			})
		};
	}

	function generateShadesAndTints(hex: string, count: number): string[] {
		const baseColor = hex.replace('#', '');
		const r = parseInt(baseColor.substring(0, 2), 16);
		const g = parseInt(baseColor.substring(2, 4), 16);
		const b = parseInt(baseColor.substring(4, 6), 16);

		const step = Math.floor(255 / (count + 3));
		const colors: string[] = [];

		for (let i = 1; i <= count / 2 + 1; i++) {
			const newR = Math.max(r - i * step, 0);
			const newG = Math.max(g - i * step, 0);
			const newB = Math.max(b - i * step, 0);
			const shade = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
			colors.push(shade);
		}
		for (let i = 1; i <= count / 2; i++) {
			const newR = Math.min(r + i * step, 255);
			const newG = Math.min(g + i * step, 255);
			const newB = Math.min(b + i * step, 255);
			const tint = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
			colors.push(tint);
		}
		console.log(colors);
		return colors;
	}

	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);
	let data = generateData();
</script>

<Line {data} class="mb-6 mt-2" />
