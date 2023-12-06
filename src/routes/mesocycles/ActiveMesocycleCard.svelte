<script lang="ts">
	import { getTotalDuration } from "$lib/util/MesocycleTemplate";
	export let activeMesocycleTemplate: MesocycleTemplate;
	export let activeMesocycle: ActiveMesocycle;

	let totalCycles: number, totalWorkouts: number;
	if (activeMesocycleTemplate) {
		const totalNonRestDays = activeMesocycleTemplate.exerciseSplit.filter(
			(split) => split !== null
		).length;
		totalCycles = getTotalDuration(activeMesocycleTemplate.RIRProgression);
		totalWorkouts = totalCycles * totalNonRestDays;
	}
</script>

<a class="btn btn-primary rounded-md h-fit p-2" href="/mesocycles/active">
	<div class="grid grid-cols-3 place-items-center w-full gap-2">
		<span class="font-semibold text-lg text-secondary text-left col-span-2">
			{activeMesocycleTemplate.name}
		</span>
		<span class="row-span-2 font-normal">
			{activeMesocycle.workouts.length}/{totalWorkouts} workouts completed
		</span>
		<progress
			class="progress progress-accent col-span-2"
			value={activeMesocycle.workouts.length}
			max={totalWorkouts}
		></progress>
	</div>
</a>
