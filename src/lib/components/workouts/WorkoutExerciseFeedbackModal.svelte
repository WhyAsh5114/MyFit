<script lang="ts">
  import { jointPainFeedback, pumpFeedback } from "$lib/types/arrays";
  import MyModal from "../MyModal.svelte";
  import MuscleGroupFeedbackModal from "./MuscleGroupFeedbackModal.svelte";
  import { groupBy } from "$lib/util/CommonFunctions";

  export let dialogElement: HTMLDialogElement;
  export let feedbackExerciseIdx: number | undefined;
  export let exercises: WorkoutExerciseWithoutSetNumbers[];
  export let feedbackTaken: boolean[];
  export let mode: "editing" | "performing" | "viewing";
  export let workoutsThatPreviouslyTargeted: APIGetWorkoutsThatPreviouslyTargetedResponse;

  let feedbackExercise: WorkoutExerciseWithoutSetNumbers | undefined;
  $: if (feedbackExerciseIdx !== undefined) {
    feedbackExercise = exercises[feedbackExerciseIdx];
  } else {
    feedbackExercise = undefined;
  }

  export let muscleGroupWorkloads: Workout["muscleGroupWorkloads"] = {};
  export let sorenessFromPreviousWorkouts: Workout["muscleSorenessToNextWorkout"] = {};

  let muscleGroupFeedbackModal: HTMLDialogElement;
  let showMuscleGroupFeedbackModal = false;
  let takeFeedbackForMuscleGroup: MuscleGroup | undefined;

  $: {
    const groupedExercises = groupBy(exercises, (exercise) => exercise.targetMuscleGroup);
    if (feedbackExercise) {
      let muscleGroupCompleted = true;
      for (const { idx } of groupedExercises[feedbackExercise.targetMuscleGroup]) {
        if (!feedbackTaken[idx]) {
          muscleGroupCompleted = false;
        }
      }
      if (muscleGroupCompleted) {
        takeFeedbackForMuscleGroup = feedbackExercise.targetMuscleGroup;
        showMuscleGroupFeedbackModal = true;
      }
    }
  }

  function closeModal() {
    if (mode === "editing" && feedbackExercise) {
      takeFeedbackForMuscleGroup = feedbackExercise.targetMuscleGroup;
      showMuscleGroupFeedbackModal = true;
    }
    if (showMuscleGroupFeedbackModal) {
      muscleGroupFeedbackModal.show();
      showMuscleGroupFeedbackModal = false;
    }
  }
</script>

<MuscleGroupFeedbackModal
  bind:dialogElement={muscleGroupFeedbackModal}
  bind:muscleGroup={takeFeedbackForMuscleGroup}
  bind:muscleGroupWorkloads
  bind:sorenessFromPreviousWorkouts
  bind:workoutsThatPreviouslyTargeted
/>

<MyModal onClose={closeModal} title="Exercise feedback" bind:dialogElement>
  {#if feedbackExercise}
    <div class="flex flex-col">
      <span class="font-semibold text-lg mb-2">{feedbackExercise.name}</span>

      <span class="text-secondary/75">Pump rating</span>
      <div class="join mt-1 gap-0.5 grid grid-cols-3">
        {#each pumpFeedback as { name, value, bgColor }}
          <input
            name="pump-feedback"
            class="join-item btn capitalize {bgColor} checked:!text-black"
            aria-label={name}
            type="radio"
            {value}
            bind:group={feedbackExercise.pumpRating}
          />
        {/each}
      </div>

      <span class="text-secondary/75">Joint pain rating</span>
      <div class="join mt-1 gap-0.5 grid grid-cols-3">
        {#each jointPainFeedback as { name, value, bgColor }}
          <input
            name="joint-pain-feedback"
            class="join-item btn capitalize {bgColor} checked:!text-black"
            aria-label={name}
            type="radio"
            {value}
            bind:group={feedbackExercise.jointPainRating}
          />
        {/each}
      </div>
    </div>
  {/if}
</MyModal>
