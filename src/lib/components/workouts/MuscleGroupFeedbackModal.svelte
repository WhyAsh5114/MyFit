<script lang="ts">
	import { sorenessFeedback, workloadFeedback } from "$lib/types/arrays";
	import MyModal from "../MyModal.svelte";
	export let dialogElement: HTMLDialogElement;
	export let muscleGroup: MuscleGroup | undefined = undefined;
	export let sorenessFromPreviousWorkouts: Workout["muscleSorenessToNextWorkout"];
	export let muscleGroupWorkloads: Workout["muscleGroupWorkloads"];
	export let workoutsThatPreviouslyTargeted: APIGetWorkoutsThatPreviouslyTargetedResponse;
</script>

<MyModal bind:dialogElement title="Muscle group workload feedback">
	{#if muscleGroup}
		<div class="flex flex-col">
			<span class="font-semibold text-lg mb-2">{muscleGroup}</span>

			<span class="text-secondary/75">Workload</span>
			<div class="join mt-1 gap-0.5 grid grid-cols-4">
				{#each workloadFeedback as { name, value, bgColorChecked }}
					<input
						class="join-item btn capitalize {bgColorChecked} checked:!text-black"
						type="radio"
						name="workload-feedback"
						aria-label={name}
						{value}
						bind:group={muscleGroupWorkloads[muscleGroup]}
					/>
				{/each}
			</div>

			{#if workoutsThatPreviouslyTargeted[muscleGroup] !== null}
				<span class="text-secondary/75">Soreness</span>
				<div class="join mt-1 gap-0.5 grid grid-cols-4">
					{#each sorenessFeedback as { name, value, bgColorChecked }}
						<input
							class="join-item btn capitalize {bgColorChecked} checked:!text-black"
							type="radio"
							name="soreness-feedback"
							aria-label={name}
							{value}
							bind:group={sorenessFromPreviousWorkouts[muscleGroup]}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</MyModal>
