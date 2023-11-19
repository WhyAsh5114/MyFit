<script lang="ts">
	export let activeMesocycle: ActiveMesocycle;
	export let activeMesocycleTemplate: MesocycleTemplate;

	let todaysWorkout: { name: string; exercises: SplitExercise[] } | null = null;
	if (activeMesocycle) {
		todaysWorkout =
			activeMesocycleTemplate.exerciseSplit[
				activeMesocycle.workouts.length % activeMesocycleTemplate.exerciseSplit.length
			];
	}

	let totalSets = 0;
	let targetMuscleGroups: Set<MuscleGroup> = new Set();
	if (todaysWorkout) {
		todaysWorkout.exercises.forEach((exercise) => {
			totalSets += exercise.sets;
			targetMuscleGroups.add(exercise.targetMuscleGroup);
		});
	}
</script>

<div class="btn btn-primary h-fit py-2 px-4">
	<div class="flex flex-col gap-1 w-full font-normal">
		<div class="flex justify-between items-center">
			<span class="text-lg font-semibold">{todaysWorkout?.name}</span>
			<span>{totalSets} sets</span>
		</div>
		<div class="flex flex-wrap gap-1">
			{#each targetMuscleGroups as muscleGroup}
				{@const specialized = activeMesocycleTemplate.specialization?.includes(muscleGroup)}
				<span class="badge font-semibold {specialized ? 'badge-accent' : ''}">{muscleGroup}</span>
			{/each}
		</div>
	</div>
</div>
