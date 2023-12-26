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
  $: updateModalExercise(editingExercise);
  function updateModalExercise(_exercise: ExerciseTemplate | null) {
    if (_exercise) {
      modalExercise = JSON.parse(JSON.stringify(_exercise));
    } else {
      modalExercise = JSON.parse(JSON.stringify(emptyExercise));
    }
  }

  function addEditExercise() {
    const validExercise = JSON.parse(JSON.stringify(modalExercise)) as ExerciseTemplate;
    let success = true;
    if (mode === "add") {
      success = addExercise(validExercise);
    } else if (mode === "edit" && editingExerciseIdx) {
      success = editExercise(editingExerciseIdx, validExercise);
    }

    if (!success) {
      errorMsg = `${validExercise.name} has already been added`;
    } else {
      modal.close();
      errorMsg = "";
      modalExercise = JSON.parse(JSON.stringify(emptyExercise));
    }
  }
</script>

<MyModal title={editingExercise ? "Edit exercise" : "Add exercise"} bind:dialogElement={modal}>
  <form id="{mode}-exercise-form" class="flex flex-col" on:submit|preventDefault={addEditExercise}>
    <label class="form-control">
      <div class="label">
        <span class="label-text">Exercise name</span>
      </div>
      <input
        id="{mode}-exercise-name"
        class="input input-bordered"
        placeholder="Type here"
        required
        type="text"
        bind:value={modalExercise.name}
      />
    </label>
    <div class="flex gap-2">
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">Muscle group</span>
        </div>
        <select
          id="{mode}-exercise-target-muscle-group"
          class="select grow"
          required
          bind:value={modalExercise.targetMuscleGroup}
        >
          <option disabled selected value={null}>Select a muscle group</option>
          {#each muscleGroups as muscleGroup}
            <option>{muscleGroup}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-1/3">
        <div class="label">
          <span class="label-text">Sets</span>
        </div>
        <input
          id="{mode}-exercise-sets"
          class="input input-bordered"
          min={1}
          placeholder="Type here"
          required
          type="number"
          bind:value={modalExercise.sets}
        />
      </label>
    </div>
    <div class="flex gap-2">
      <label class="form-control grow">
        <div class="label">
          <span class="label-text">Rep range start</span>
        </div>
        <input
          id="{mode}-exercise-rep-range-start"
          class="input input-bordered w-full"
          min={1}
          placeholder="From"
          required
          type="number"
          bind:value={modalExercise.repRangeStart}
        />
      </label>
      <label class="form-control grow">
        <div class="label">
          <span class="label-text">Rep range end</span>
        </div>
        <input
          id="{mode}-exercise-rep-range-end"
          class="input input-bordered w-full"
          min={(modalExercise.repRangeStart ?? 0) + 1}
          placeholder="To"
          required
          type="number"
          bind:value={modalExercise.repRangeEnd}
        />
      </label>
    </div>
    <label class="form-control">
      <div class="label">
        <span class="label-text">Notes</span>
      </div>
      <textarea
        id="{mode}-exercise-note"
        class="textarea textarea-bordered"
        placeholder="Type here"
        bind:value={modalExercise.note}
      ></textarea>
    </label>
    <div class="form-control rounded-md bg-base-100 my-2 px-3">
      <label class="label cursor-pointer">
        <span class="label-text">Involves bodyweight?</span>
        <input
          id="{mode}-exercise-involves-bodyweight"
          class="checkbox border-secondary/50"
          type="checkbox"
          bind:checked={modalExercise.involvesBodyweight}
        />
      </label>
    </div>
    {#if errorMsg}
      <p class="bg-error/50 text-sm p-2 rounded-md">
        {errorMsg}
      </p>
    {/if}
  </form>
  <button class="btn btn-accent btn-block mt-4" form="{mode}-exercise-form" type="submit">
    <p>
      <span class="capitalize">{mode}</span>
      exercise
    </p>
  </button>
</MyModal>
