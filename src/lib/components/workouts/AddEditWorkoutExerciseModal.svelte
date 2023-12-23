<script lang="ts">
  import { exerciseWeightTypes, muscleGroups } from "$lib/types/arrays";
  import { splitExercisesToWorkoutExercise } from "$lib/util/CommonFunctions";
  import MyModal from "../MyModal.svelte";
  export let dialogElement: HTMLDialogElement;
  export let exercises: WorkoutExerciseWithoutSetNumbers[];
  export let editingIdx: number | undefined;
  export let allExercisesSetsCompleted: boolean[][];
  export let userBodyweight: number | null;

  let editMode = false;
  let modeText: "Add" | "Edit" = "Add";
  let selectedExercise: Partial<SplitExercise>;
  let editingExercise: Partial<SplitExercise> = {};

  $: exercises, changeEditingExercise(editingIdx);
  function changeEditingExercise(idx: number | undefined) {
    if (idx !== undefined && exercises[idx]) {
      editMode = true;
      const workoutExercise = JSON.parse(
        JSON.stringify(exercises[idx])
      ) as WorkoutExerciseWithoutSetNumbers;
      const { sets, bodyweight: exerciseBodyweight, ...otherProps } = workoutExercise;

      let weightType: "Weighted" | "Bodyweight" = "Weighted";
      if (exerciseBodyweight !== undefined) {
        weightType = "Bodyweight";
      }

      editingExercise = { sets: sets.length, weightType, ...otherProps };
      if (editingExercise.weightType === "Bodyweight") {
        userBodyweight = exerciseBodyweight ?? null;
      }
    } else {
      editMode = false;
    }
  }

  let newExercise: Partial<SplitExercise> = { weightType: "Weighted" };
  let alreadyExists = false;
  function addExercise() {
    const duplicate = exercises.find((exercise) => exercise.name === newExercise.name);
    alreadyExists = Boolean(duplicate);
    if (duplicate) {
      return false;
    }

    const typedExercise = JSON.parse(JSON.stringify(newExercise)) as SplitExercise;
    exercises = [...exercises, ...splitExercisesToWorkoutExercise([typedExercise], userBodyweight)];
    allExercisesSetsCompleted = [
      ...allExercisesSetsCompleted,
      Array(typedExercise.sets).fill(false)
    ];
    newExercise = { weightType: "Weighted" };
    selectedExercise = newExercise;
    dialogElement.close();
  }

  function editExercise(idx: number) {
    const duplicate = exercises.find(
      (exercise, exerciseIdx) => exercise.name === editingExercise.name && exerciseIdx !== idx
    );
    alreadyExists = Boolean(duplicate);
    if (duplicate) {
      return false;
    }

    const typedExercise = editingExercise as SplitExercise;
    const oldSets = exercises[idx].sets;
    if (editingExercise.weightType === "Bodyweight") {
      exercises[idx] = splitExercisesToWorkoutExercise([typedExercise], userBodyweight)[0];
    } else {
      exercises[idx] = splitExercisesToWorkoutExercise([typedExercise])[0];
    }
    exercises[idx].sets = oldSets;
    exercises = exercises;
    dialogElement.close();
  }

  function submitForm() {
    if (editingIdx !== undefined) {
      return editExercise(editingIdx);
    }
    return addExercise();
  }

  $: editMode, editingIdx && exercises[editingIdx], updateMode();
  function updateMode() {
    if (editMode) {
      modeText = "Edit";
      selectedExercise = editingExercise;
    } else {
      modeText = "Add";
      selectedExercise = newExercise;
    }
  }
</script>

<MyModal title="{modeText} exercise" bind:dialogElement>
  <form on:submit|preventDefault={submitForm}>
    <div class="form-control w-full">
      <label class="label" for="{modeText}-exercise-name">
        <span class="label-text">Exercise name</span>
        {#if alreadyExists}
          <span class="label-text-alt text-error">Already exists, use a different name</span>
        {/if}
      </label>
      <input
        id="{modeText}-exercise-name"
        class="input input-bordered w-full"
        placeholder="Type here"
        required
        type="text"
        bind:value={selectedExercise.name}
      />
    </div>
    <div class="flex gap-2">
      <div class="flex flex-col w-full max-w-xs">
        <div class="form-control w-full">
          <label class="label" for="{modeText}-exercise-weight-type">
            <span class="label-text">Weight type</span>
          </label>
          <select
            id="{modeText}-exercise-weight-type"
            class="select select-bordered"
            required
            bind:value={selectedExercise.weightType}
          >
            <option disabled selected value={undefined}>Pick one</option>
            {#each exerciseWeightTypes as weightType}
              <option>{weightType}</option>
            {/each}
          </select>
        </div>
        {#if selectedExercise.weightType === "Bodyweight"}
          <div class="form-control">
            <label class="label" for="{modeText}-exercise-bodyweight">
              <span class="label-text">Bodyweight</span>
            </label>
            <input
              id="{modeText}-exercise-bodyweight"
              class="input input-bordered w-full max-w-xs"
              min="0"
              placeholder="Type here"
              required
              step="0.01"
              type="number"
              bind:value={userBodyweight}
            />
          </div>
        {/if}
      </div>
      <div class="form-control w-full max-w-xs">
        <label class="label" for="{modeText}-exercise-muscle-group">
          <span class="label-text">Target muscle</span>
        </label>
        <select
          id="{modeText}-exercise-muscle-group"
          class="select select-bordered"
          required
          bind:value={selectedExercise.targetMuscleGroup}
        >
          <option disabled selected value={undefined}>Pick one</option>
          {#each muscleGroups as muscleGroup}
            <option>{muscleGroup}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="flex gap-2">
      <div class="form-control w-full">
        <label class="label" for="{modeText}-exercise-sets">
          <span class="label-text">Sets</span>
        </label>
        <input
          id="{modeText}-exercise-sets"
          class="input input-bordered w-full max-w-xs"
          disabled={editMode}
          min="1"
          placeholder="Type here"
          required
          type="number"
          bind:value={selectedExercise.sets}
        />
      </div>
      <div class="grid grid-cols-2 justify-items-center items-end gap-x-0.5">
        <span class="label-text col-span-2">Rep range</span>
        <input
          id="{modeText}-exercise-rep-range-start"
          class="input input-bordered w-full max-w-xs"
          min="1"
          placeholder="From"
          required
          type="number"
          bind:value={selectedExercise.repRangeStart}
        />
        <input
          id="{modeText}-exercise-rep-range-end"
          class="input input-bordered w-full max-w-xs"
          min={(selectedExercise.repRangeStart || 0) + 1}
          placeholder="To"
          required
          type="number"
          bind:value={selectedExercise.repRangeEnd}
        />
      </div>
    </div>
    <div class="form-control">
      <label class="label" for="{modeText}-exercise-note">
        <span class="label-text">Exercise note</span>
      </label>
      <textarea
        id="{modeText}-exercise-note"
        class="textarea textarea-bordered h-24 resize-none"
        placeholder="Note"
        bind:value={selectedExercise.note}
      />
    </div>
    <button class="btn btn-block btn-accent mt-4">{modeText} exercise</button>
  </form>
</MyModal>
