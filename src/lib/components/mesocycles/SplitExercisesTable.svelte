<script lang="ts">
  import { flip } from "svelte/animate";
  import SplitExerciseCard from "./SplitExerciseCard.svelte";
  import { slide } from "svelte/transition";
  import AddEditSplitExerciseModal from "./AddEditSplitExerciseModal.svelte";
  export let exercises: SplitExercise[];

  let addEditSplitExerciseModal: HTMLDialogElement;
  let editingExerciseNumber: number | undefined;

  function addExercise() {
    editingExerciseNumber = undefined;
    addEditSplitExerciseModal.show();
  }

  function editExercise(idx: number) {
    editingExerciseNumber = idx;
    addEditSplitExerciseModal.show();
  }

  function deleteExercise(idx: number) {
    exercises.splice(idx, 1);
    exercises = exercises;
  }

  function reorderExercise(idx: number, s: "down" | "up") {
    if (s == "up") {
      [exercises[idx], exercises[idx - 1]] = [exercises[idx - 1], exercises[idx]];
    } else {
      [exercises[idx], exercises[idx + 1]] = [exercises[idx + 1], exercises[idx]];
    }
  }
</script>

<AddEditSplitExerciseModal
  bind:dialogElement={addEditSplitExerciseModal}
  bind:exercises
  bind:editingIdx={editingExerciseNumber}
/>
<ul class="flex flex-col gap-1 h-px grow overflow-y-auto">
  {#each exercises as exercise, idx (exercise.name)}
    <div transition:slide|local={{ duration: 200 }} animate:flip={{ duration: 200 }}>
      <SplitExerciseCard
        {deleteExercise}
        {editExercise}
        {idx}
        {reorderExercise}
        bind:totalExercises={exercises.length}
        bind:exercise
      />
    </div>
  {/each}
</ul>
<button class="btn btn-primary btn-block mt-1" on:click={addExercise}> + Add exercise </button>
