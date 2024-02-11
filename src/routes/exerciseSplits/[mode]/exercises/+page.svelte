<script lang="ts">
  import SplitDaySelector from "../../SplitDaySelector.svelte";
  import ExerciseSplitTable from "../../ExerciseSplitTable.svelte";
  import { editingSplitId, exerciseSplitDays, splitName } from "../splitStore";
  import CutIcon from "virtual:icons/material-symbols/cut";
  import CopyIcon from "virtual:icons/material-symbols/content-copy";
  import PasteIcon from "virtual:icons/material-symbols/content-paste";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { paramMap } from "$lib/types/arrays";
  $: ({ params } = $page);

  let callingEndpoint = false;
  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";
  let modalOnClose = () => {};

  let selectedSplitDayIndex = $exerciseSplitDays.findIndex((splitDay) => splitDay !== null);
  let selectedSplitDay = $exerciseSplitDays[selectedSplitDayIndex] as ExerciseSplitDay;
  let copiedExercises: ExerciseTemplate[] = [];

  $: updateSelectedSplitDay(selectedSplitDayIndex);
  $: $exerciseSplitDays[selectedSplitDayIndex] = selectedSplitDay;

  function updateSelectedSplitDay(_selectedSplitDayIndex: number) {
    if ($exerciseSplitDays[_selectedSplitDayIndex] !== null) {
      selectedSplitDay = $exerciseSplitDays[_selectedSplitDayIndex] as ExerciseSplitDay;
    }
  }

  function copyExercises() {
    copiedExercises = JSON.parse(
      JSON.stringify(selectedSplitDay.exerciseTemplates)
    ) as ExerciseTemplate[];
  }

  function pasteExercises() {
    selectedSplitDay.exerciseTemplates = JSON.parse(
      JSON.stringify(copiedExercises)
    ) as ExerciseTemplate[];
  }

  function cutExercises() {
    copyExercises();
    selectedSplitDay.exerciseTemplates = [];
  }

  function validateSplit() {
    const invalidSplitDays: string[] = [];
    $exerciseSplitDays.forEach((splitDay) => {
      if (splitDay === null) return;
      if (splitDay.exerciseTemplates.length === 0) invalidSplitDays.push(splitDay.name);
    });
    if (invalidSplitDays.length > 0) {
      modalTitle = "Error";
      modalText =
        "Add at least one exercise to the following workouts: " + invalidSplitDays.join(", ");
      modal.show();
      return false;
    }
    return true;
  }

  async function submitSplit() {
    modalOnClose = () => {};
    if (!validateSplit()) return;
    const exerciseSplit: ExerciseSplit = {
      name: $splitName,
      splitDays: $exerciseSplitDays
    };
    callCreateOrEditSplitEndpoint(exerciseSplit, params.mode);
  }

  async function callCreateOrEditSplitEndpoint(exerciseSplit: ExerciseSplit, mode: string) {
    callingEndpoint = true;
    let endpointURL = "/api/exerciseSplits";
    if (mode === "edit") endpointURL += `/${$editingSplitId}`;

    const response = await fetch(endpointURL, {
      method: mode === "new" ? "POST" : "PUT",
      body: JSON.stringify(exerciseSplit),
      headers: { "content-type": "application/json" }
    });

    if (response.ok) modalOnClose = invalidateAndRedirect;
    modalTitle = response.ok ? "Success" : "Error";
    modalText = await response.text();
    modal.show();
    callingEndpoint = false;
  }

  async function invalidateAndRedirect() {
    await invalidate("/api/exerciseSplits");
    await goto("/exerciseSplits");
  }
</script>

<MyModal {modalOnClose} title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>Exercises</h3>

<SplitDaySelector exerciseSplitDays={$exerciseSplitDays} bind:selectedSplitDayIndex />

{#if selectedSplitDay}
  {#key selectedSplitDayIndex}
    <ExerciseSplitTable bind:exerciseTemplates={selectedSplitDay.exerciseTemplates} />
  {/key}
  <div class="join grid grid-cols-3 mt-1 gap-1">
    <button
      class="join-item btn btn-error"
      disabled={selectedSplitDay.exerciseTemplates.length === 0}
      on:click={() => cutExercises()}
    >
      <CutIcon /> Cut
    </button>
    <button
      class="join-item btn btn-primary"
      disabled={selectedSplitDay.exerciseTemplates.length === 0}
      on:click={() => copyExercises()}
    >
      <CopyIcon /> Copy
    </button>
    <button
      class="join-item btn btn-primary"
      disabled={copiedExercises.length === 0 || selectedSplitDay.exerciseTemplates.length !== 0}
      on:click={() => pasteExercises()}
    >
      <PasteIcon /> Paste
    </button>
  </div>
{/if}

<button class="btn btn-accent btn-block mt-2" disabled={callingEndpoint} on:click={submitSplit}>
  {#if !callingEndpoint}
    {paramMap[params.mode].action} exercise split
  {:else}
    {paramMap[params.mode].verb} exercise split <span class="loading loading-spinner"></span>
  {/if}
</button>
