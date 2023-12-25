<script lang="ts">
  import MyModal from "$lib/components/MyModal.svelte";
  import { muscleGroups } from "$lib/types/arrays";
  export let editingExercise: ExerciseTemplate | null;
  export let editingExerciseIdx: number | null;
  export let modal: HTMLDialogElement;
  export let addExercise: (exercise: ExerciseTemplate) => boolean;
  export let editExercise: (idx: number, exercise: ExerciseTemplate) => boolean;

  const emptyExercise = {
    name: "",
    sets: null,
    targetMuscleGroup: null,
    repRangeStart: null,
    repRangeEnd: null,
    involvesBodyweight: false,
    note: ""
  };

  let errorMsg = "";
  $: mode = editingExercise ? "edit" : "add";

  let modalExercise: Nullable<ExerciseTemplate>;
  $: modalExercise = editingExercise
    ? JSON.parse(JSON.stringify(editingExercise))
    : JSON.parse(JSON.stringify(emptyExercise));
  function addEditExercise() {
    const validExercise = JSON.parse(JSON.stringify(modalExercise)) as ExerciseTemplate;
    let success = true;
    if (mode === "add") {
      success = addExercise(validExercise);
    } else if (mode === "edit" && editingExerciseIdx) {
      success = editExercise(editingExerciseIdx, validExercise) === false;
    }

    if (!success) {
      errorMsg = `${validExercise.name} has already been added`;
    } else {
      modal.close();
      modalExercise = JSON.parse(JSON.stringify(emptyExercise));
    }
  }
</script>

<MyModal title={editingExercise ? "Edit exercise" : "Add exercise"} bind:dialogElement={modal}>
  <form
    id="{mode}-exercise-form"
    class="flex flex-col gap-1.5"
    on:submit|preventDefault={addEditExercise}
  >
    <input
      id="{mode}-exercise-name"
      class="input input-bordered"
      placeholder="Exercise name"
      required
      type="text"
      bind:value={modalExercise.name}
    />
    <div class="form-control bg-base-100 rounded-md px-3 py-1">
      <label class="label cursor-pointer">
        <span class="label-text text-secondary">Involves bodyweight?</span>
        <input
          id="{mode}-exercise-involves-bodyweight"
          class="checkbox border-secondary/50 border-2"
          type="checkbox"
          bind:checked={modalExercise.involvesBodyweight}
        />
      </label>
    </div>
    <div class="flex gap-2">
      <select
        id="{mode}-exercise-target-muscle-group"
        class="select grow"
        required
        bind:value={modalExercise.targetMuscleGroup}
      >
        <option disabled selected value={null}>Pick one</option>
        {#each muscleGroups as muscleGroup}
          <option>{muscleGroup}</option>
        {/each}
      </select>
      <input
        id="{mode}-exercise-sets"
        class="input input-bordered w-1/3"
        min={1}
        placeholder="Sets"
        required
        type="number"
        bind:value={modalExercise.sets}
      />
    </div>
    <div class="flex gap-2">
      <input
        id="{mode}-exercise-rep-range-start"
        class="input input-bordered w-full max-w-xs"
        min={1}
        placeholder="Rep range start"
        required
        type="number"
        bind:value={modalExercise.repRangeStart}
      />
      <input
        id="{mode}-exercise-rep-range-end"
        class="input input-bordered w-full max-w-xs"
        min={(modalExercise.repRangeStart ?? 0) + 1}
        placeholder="Rep range end"
        required
        type="number"
        bind:value={modalExercise.repRangeEnd}
      />
    </div>
    <textarea class="textarea textarea-bordered" placeholder="Notes" bind:value={modalExercise.note}
    ></textarea>
  </form>
  <button class="btn btn-accent btn-block mt-4" form="{mode}-exercise-form" type="submit">
    <p>
      <span class="capitalize">{mode}</span>
      exercise
    </p>
  </button>
  <p class="text-error font-semibold">
    {errorMsg}
  </p>
</MyModal>
