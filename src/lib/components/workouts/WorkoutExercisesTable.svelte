<script lang="ts">
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import AddEditWorkoutExerciseModal from "./AddEditWorkoutExerciseModal.svelte";
  import WorkoutExerciseCard from "./WorkoutExerciseCard.svelte";
  import WorkoutExerciseFeedbackModal from "./WorkoutExerciseFeedbackModal.svelte";

  export let exercises: WorkoutExerciseWithoutSetNumbers[];
  export let mode: "viewing" | "editing" | "performing";
  export let referenceWorkout: Workout | null = null;
  export let userBodyweight: number | null = null;
  export let workoutsThatPreviouslyTargeted: APIGetWorkoutsThatPreviouslyTargetedResponse = {};

  let comparing = false;

  export let allExercisesSetsCompleted: boolean[][] = [];
  if (allExercisesSetsCompleted.length === 0) {
    exercises.forEach((exercise) => {
      let setCompleted = mode !== "performing";
      allExercisesSetsCompleted.push(Array(exercise.sets.length).fill(setCompleted));
    });
  }
  let feedbackTaken: boolean[] = Array(exercises.length).fill(false);

  let addEditWorkoutExerciseModal: HTMLDialogElement;
  let editingExerciseNumber: number | undefined = undefined;

  function addExercise() {
    editingExerciseNumber = undefined;
    addEditWorkoutExerciseModal.show();
  }

  function editExercise(idx: number) {
    editingExerciseNumber = idx;
    addEditWorkoutExerciseModal.show();
  }

  function deleteExercise(idx: number) {
    exercises.splice(idx, 1);
    exercises = exercises;
    allExercisesSetsCompleted.splice(idx, 1);
    allExercisesSetsCompleted = allExercisesSetsCompleted;
  }

  function reorderExercise(idx: number, direction: "up" | "down") {
    if (direction == "up") {
      [exercises[idx], exercises[idx - 1]] = [exercises[idx - 1], exercises[idx]];
      [allExercisesSetsCompleted[idx], allExercisesSetsCompleted[idx - 1]] = [
        allExercisesSetsCompleted[idx - 1],
        allExercisesSetsCompleted[idx]
      ];
    } else {
      [exercises[idx], exercises[idx + 1]] = [exercises[idx + 1], exercises[idx]];
      [allExercisesSetsCompleted[idx], allExercisesSetsCompleted[idx + 1]] = [
        allExercisesSetsCompleted[idx + 1],
        allExercisesSetsCompleted[idx]
      ];
    }
  }

  let feedbackModal: HTMLDialogElement;
  let feedbackExerciseIdx: number | undefined = undefined;
  function takeFeedback(idx: number, force = false) {
    if (feedbackTaken[idx] === true && !force) return;
    if (!feedbackModal) return;
    feedbackExerciseIdx = idx;
    feedbackModal.show();
    feedbackTaken[idx] = true;
  }

  export let muscleGroupWorkloads: Workout["muscleGroupWorkloads"] = {};
  export let sorenessFromPreviousWorkouts: Workout["muscleSorenessToNextWorkout"] = {};
</script>

<AddEditWorkoutExerciseModal
  bind:dialogElement={addEditWorkoutExerciseModal}
  bind:exercises
  bind:editingIdx={editingExerciseNumber}
  bind:allExercisesSetsCompleted
  bind:userBodyweight
/>
<WorkoutExerciseFeedbackModal
  bind:dialogElement={feedbackModal}
  bind:feedbackExerciseIdx
  bind:exercises
  bind:feedbackTaken
  bind:muscleGroupWorkloads
  bind:sorenessFromPreviousWorkouts
  bind:workoutsThatPreviouslyTargeted
  bind:mode
/>

<div class="flex flex-col h-px grow overflow-y-auto mt-2 gap-1">
  {#each exercises as exercise, i (exercise.name)}
    <div transition:slide|local={{ duration: 200 }} animate:flip={{ duration: 200 }}>
      <WorkoutExerciseCard
        {deleteExercise}
        {editExercise}
        exerciseIndex={i}
        {mode}
        referenceExercise={referenceWorkout?.exercisesPerformed[i] ?? null}
        {reorderExercise}
        {takeFeedback}
        totalExercises={exercises.length}
        {userBodyweight}
        bind:exercise
        bind:setsCompleted={allExercisesSetsCompleted[i]}
        bind:comparing
      />
    </div>
  {/each}
</div>

<div class="join mt-1 w-full gap-1">
  {#if referenceWorkout}
    {#if !comparing}
      <button class="join-item btn btn-primary w-1/2 grow" on:click={() => (comparing = true)}>
        Compare
      </button>
    {:else}
      <button class="join-item btn btn-primary w-1/2 grow" on:click={() => (comparing = false)}>
        Back
      </button>
    {/if}
  {/if}
  {#if mode === "performing"}
    <button class="join-item btn btn-primary w-1/2 grow" on:click={addExercise}>
      Add exercise
    </button>
  {/if}
</div>
