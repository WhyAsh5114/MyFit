<script lang="ts">
  import AddEditExerciseModal from "./AddEditExerciseModal.svelte";
  import AddIcon from "virtual:icons/material-symbols/add";

  export let exerciseTemplates: ExerciseTemplate[];
  let editingExercise: ExerciseTemplate | null = null;
  let editingExerciseIdx: number | null = null;
  let addEditExerciseModal: HTMLDialogElement;

  function addExercise(exercise: ExerciseTemplate) {
    if (exerciseTemplates.find((_exercise) => _exercise.name === exercise.name)) {
      return false;
    }
    exerciseTemplates = [...exerciseTemplates, exercise];
    return true;
  }
  function editExercise() {
    return false;
  }

  function showAddExerciseModal() {
    editingExercise = null;
    addEditExerciseModal.show();
  }
  function showEditExerciseModal() {}
</script>

<AddEditExerciseModal
  {addExercise}
  {editExercise}
  {editingExercise}
  {editingExerciseIdx}
  bind:modal={addEditExerciseModal}
/>

<div class="flex flex-col gap-1 h-px grow overflow-y-auto">
  {#each exerciseTemplates as exerciseTemplate}
    <div class="flex flex-col bg-primary rounded-sm p-2">
      <div class="flex">
        <span class="font-semibold">{exerciseTemplate.name}</span>
        {#if exerciseTemplate.involvesBodyweight}
          <span class="badge font-semibold">BW</span>
        {/if}
      </div>
    </div>
  {/each}
</div>
<button class="btn btn-primary" on:click={showAddExerciseModal}>
  <AddIcon /> Add exercise
</button>
