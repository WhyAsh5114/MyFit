<script lang="ts">
  import AddEditExerciseModal from "./AddEditExerciseModal.svelte";
  import AddIcon from "virtual:icons/material-symbols/add";
  import MenuIcon from "virtual:icons/material-symbols/menu";
  import CloseIcon from "virtual:icons/material-symbols/close";
  import EditIcon from "virtual:icons/material-symbols/edit-outline";
  import DeleteIcon from "virtual:icons/material-symbols/delete-outline";
  import UpArrow from "virtual:icons/mdi/arrow-up";
  import DownArrow from "virtual:icons/mdi/arrow-down";

  export let exerciseTemplates: ExerciseTemplate[];
  let editingExercise: ExerciseTemplate | null = null;
  let editingExerciseIdx: number | null = null;
  let addEditExerciseModal: HTMLDialogElement;

  function addExercise(exercise: ExerciseTemplate) {
    if (exerciseTemplates.find((_ex) => _ex.name === exercise.name)) {
      return false;
    }
    exerciseTemplates = [...exerciseTemplates, exercise];
    return true;
  }
  function editExercise(idx: number, exercise: ExerciseTemplate) {
    if (exerciseTemplates.find((_ex, _idx) => _ex.name === exercise.name && _idx !== idx)) {
      return false;
    }
    exerciseTemplates.splice(idx, 1, exercise);
    exerciseTemplates = exerciseTemplates;
    return true;
  }

  function showAddExerciseModal() {
    editingExercise = null;
    addEditExerciseModal.show();
  }
  function showEditExerciseModal(idx: number) {
    editingExerciseIdx = idx;
    editingExercise = exerciseTemplates[idx];
    addEditExerciseModal.show();
  }

  function closeOtherMenus(e: Event & { currentTarget: EventTarget & HTMLDetailsElement }) {
    const summary = e.currentTarget.firstChild as Element;
    summary.removeChild(summary.firstElementChild as Element);
    if (e.currentTarget.open) {
      new CloseIcon({ target: summary });
    } else {
      new MenuIcon({ target: summary });
      return;
    }
    const allDetails = document.querySelectorAll("details");
    allDetails.forEach((detail) => {
      if (detail !== e.target) {
        detail.open = false;
      }
    });
  }
</script>

<AddEditExerciseModal
  {addExercise}
  {editExercise}
  {editingExercise}
  {editingExerciseIdx}
  bind:modal={addEditExerciseModal}
/>

<div class="flex flex-col gap-1 h-px grow overflow-y-auto">
  {#each exerciseTemplates as exercise, exerciseIdx}
    <div class="flex flex-col bg-primary rounded-md p-2">
      <div class="flex items-center gap-2">
        <span class="font-semibold">{exercise.name}</span>
        {#if exercise.involvesBodyweight}
          <span class="badge font-semibold">BW</span>
        {/if}
        <details class="dropdown dropdown-end ml-auto" on:toggle={closeOtherMenus}>
          <summary class="btn btn-sm p-0 btn-ghost">
            <MenuIcon />
          </summary>
          <ul
            class="p-2 shadow-lg grid grid-cols-2 dropdown-content z-[1] bg-neutral rounded-md w-32 gap-1"
          >
            <li>
              <button
                class="btn btn-sm btn-primary rounded-sm p-0 w-full"
                aria-label="Move exercise up"
              >
                <UpArrow />
              </button>
            </li>
            <li>
              <button
                class="btn btn-sm btn-primary rounded-sm p-0 w-full"
                aria-label="Move exercise down"
              >
                <DownArrow />
              </button>
            </li>
            <li>
              <button
                class="btn btn-sm btn-primary rounded-sm p-0 w-full"
                aria-label="Edit exercise"
                on:click={() => showEditExerciseModal(exerciseIdx)}
              >
                <EditIcon />
              </button>
            </li>
            <li>
              <button
                class="btn btn-sm btn-error rounded-sm p-0 w-full"
                aria-label="Delete exercise"
              >
                <DeleteIcon />
              </button>
            </li>
          </ul>
        </details>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-sm">
          {exercise.sets} sets of {exercise.repRangeStart} to {exercise.repRangeEnd}
          reps
        </p>
        <span class="badge badge-error font-semibold text-black">{exercise.targetMuscleGroup}</span>
      </div>
    </div>
  {/each}
</div>
<button class="btn btn-primary" on:click={showAddExerciseModal}>
  <AddIcon /> Add exercise
</button>
