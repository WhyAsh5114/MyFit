<script lang="ts">
	import { getTodaysWorkout } from "$lib/util/MesocycleTemplate";
	export let activeMesocycle: ActiveMesocycle;
	export let activeMesocycleTemplate: MesocycleTemplate;

	let todaysWorkout: { name: string; exercises: SplitExercise[] } | null = null;
	if (activeMesocycle) {
		todaysWorkout = getTodaysWorkout(
			activeMesocycle.workouts,
			activeMesocycleTemplate.exerciseSplit
		).workout;
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

{#if todaysWorkout}
	<a class="btn btn-primary h-fit py-2 px-4" href="/workouts/new">
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
	</a>
{:else}
	<div class="flex p-2 text-accent bg-primary rounded-md font-semibold justify-center">
		Rest day! ✨
	</div>
{/if}
