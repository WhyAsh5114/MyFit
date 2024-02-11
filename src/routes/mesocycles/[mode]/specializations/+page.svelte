<script lang="ts">
  import AddIcon from "virtual:icons/material-symbols/add";
  import CloseIcon from "virtual:icons/material-symbols/close";
  import { page } from "$app/stores";
  import { slide } from "svelte/transition";
  import {
    primarySpecializations,
    secondarySpecializations,
    useSpecializations,
    remainingMuscleGroups,
    mesocycleName,
    mesocycleRIRProgression,
    selectedSplitId,
    mesocycleCaloricState,
    startMesocycleNow,
    editingMesocycleId,
    clearMesocycleStores
  } from "../mesocycleStore";
  import MyModal from "$lib/components/MyModal.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { paramMap } from "$lib/types/arrays";
  export let data;
  $: ({ params } = $page);

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";
  let modalOnClose = () => {};
  let callingEndpoint = false;
  let selectedMuscleGroup: null | MuscleGroup = null;

  function specializeMuscleGroup(category: "primary" | "secondary") {
    if (category === "primary" && selectedMuscleGroup) {
      $primarySpecializations = [...$primarySpecializations, selectedMuscleGroup];
    } else if (selectedMuscleGroup) {
      $secondarySpecializations = [...$secondarySpecializations, selectedMuscleGroup];
    }
    if (selectedMuscleGroup) {
      const idx = $remainingMuscleGroups.indexOf(selectedMuscleGroup);
      $remainingMuscleGroups.splice(idx, 1);
      $remainingMuscleGroups = $remainingMuscleGroups;
      selectedMuscleGroup = null;
    }
  }

  function removeMuscleGroup(category: "primary" | "secondary", muscleGroup: MuscleGroup) {
    if (category === "primary") {
      const idx = $primarySpecializations.indexOf(muscleGroup);
      $primarySpecializations.splice(idx, 1);
      $primarySpecializations = $primarySpecializations;
    } else {
      const idx = $secondarySpecializations.indexOf(muscleGroup);
      $secondarySpecializations.splice(idx, 1);
      $secondarySpecializations = $secondarySpecializations;
    }
    $remainingMuscleGroups = [...$remainingMuscleGroups, muscleGroup];
  }

  function validateMesocycle() {
    const totalSpecializations = $primarySpecializations.length + $secondarySpecializations.length;
    if (!totalSpecializations && $useSpecializations) {
      modalTitle = "Error";
      modalText = "Add at least one specialization, or disable it to continue";
      modalOnClose = () => {};
      modal.show();
      return false;
    }
    return true;
  }

  function buildCurrentMesocycle() {
    let specializations: Mesocycle["specializations"] = null;
    if ($useSpecializations) {
      specializations = [];
      for (const muscleGroup of $primarySpecializations) {
        specializations.push({ muscleGroup, type: "primary" });
      }
      for (const muscleGroup of $secondarySpecializations) {
        specializations.push({ muscleGroup, type: "secondary" });
      }
    }
    const currentMesocycle: Omit<Mesocycle, "startTimestamp"> = {
      name: $mesocycleName,
      RIRProgression: $mesocycleRIRProgression,
      exerciseSplitId: $selectedSplitId as string,
      caloricBalance: $mesocycleCaloricState,
      endTimestamp: null,
      workouts: [],
      performanceLosses: { exercises: [], muscleGroups: [], microcycle: null },
      specializations
    };
    return currentMesocycle;
  }

  async function submitMesocycle() {
    modalOnClose = () => {};
    if (!validateMesocycle()) return;
    const currentMesocycle = buildCurrentMesocycle();
    callCreateOrEditMesocycleEndpoint(currentMesocycle, params.mode);
  }

  async function callCreateOrEditMesocycleEndpoint(
    mesocycle: Omit<Mesocycle, "startTimestamp">,
    mode: string
  ) {
    callingEndpoint = true;
    let endpointURL = "/api/mesocycles";
    if (mode === "edit") endpointURL += `/${$editingMesocycleId}`;

    const response = await fetch("/api/mesocycles", {
      method: mode === "new" ? "POST" : "PUT",
      body: JSON.stringify({ mesocycle, startNow: $startMesocycleNow }),
      headers: { "content-type": "application/json" }
    });

    if (response.ok) modalOnClose = invalidateAndRedirect;
    modalTitle = response.ok ? "Success" : "Error";
    modalText = await response.text();
    modal.show();
    callingEndpoint = false;
  }

  async function invalidateAndRedirect() {
    clearMesocycleStores();
    await invalidate("/api/mesocycles");
    await goto("/mesocycles");
  }
</script>

<MyModal {modalOnClose} title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
<h3>Specializations</h3>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text text-base font-semibold">Start immediately</span>
    <input
      id="startMesocycleNow"
      class="toggle"
      type="checkbox"
      bind:checked={$startMesocycleNow}
    />
  </label>
</div>
{#if data.activeMesocycles.length > 0 && $startMesocycleNow}
  <p class="text-warning text-sm px-1 -mt-2" transition:slide={{ duration: 200 }}>
    Doing so will end the current mesocycle,
    <span class="font-semibold italic">{data.activeMesocycles[0].name}</span>
  </p>
{/if}

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text text-base font-semibold">Use specialization</span>
    <input
      id="use-specializtion"
      class="toggle"
      type="checkbox"
      bind:checked={$useSpecializations}
    />
  </label>
</div>

{#if $useSpecializations}
  <div class="flex flex-col gap-2 mx-auto w-full -mt-4">
    <div transition:slide={{ duration: 200 }}>
      <label class="form-control w-full mx-auto">
        <div class="label">
          <span class="label-text">Select a muscle group to specialize</span>
        </div>
        <select
          id="muscle-group-to-specialize"
          class="select select-bordered"
          bind:value={selectedMuscleGroup}
        >
          <option disabled selected value={null}>Pick one</option>
          {#each $remainingMuscleGroups as muscleGroup}
            <option>{muscleGroup}</option>
          {/each}
        </select>
      </label>
      <div class="join grid grid-cols-2 gap-1 mt-1 rounded-md mx-auto w-full">
        <button
          class="join-item btn btn-primary"
          on:click={() => specializeMuscleGroup("secondary")}
        >
          <AddIcon /> Secondary
        </button>
        <button
          class="join-item btn btn-primary text-accent"
          on:click={() => specializeMuscleGroup("primary")}
        >
          <AddIcon /> Primary
        </button>
      </div>
    </div>
    <div class="flex flex-col gap-1" transition:slide={{ duration: 200 }}>
      <div class="collapse collapse-arrow rounded-md bg-primary">
        <input id="primary-specializations" name="specialization-accordion" checked type="radio" />
        <div class="collapse-title text-accent text-lg font-medium">Primary specializations</div>
        <!-- eslint-disable-next-line svelte/prefer-destructured-store-props -->
        {#if $primarySpecializations.length > 0}
          <div class="collapse-content backdrop-brightness-50">
            <div class="flex flex-wrap mt-4 gap-1">
              {#each $primarySpecializations as muscleGroup}
                <button
                  class="badge badge-error font-semibold text-black flex gap-1"
                  on:click={() => removeMuscleGroup("primary", muscleGroup)}
                >
                  {muscleGroup}
                  <CloseIcon />
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      <div class="collapse collapse-arrow rounded-md bg-primary">
        <input id="secondary-specializations" name="specialization-accordion" type="radio" />
        <div class="collapse-title text-lg font-medium">Secondary specializations</div>
        <!-- eslint-disable-next-line svelte/prefer-destructured-store-props -->
        {#if $secondarySpecializations.length > 0}
          <div class="collapse-content backdrop-brightness-50">
            <div class="flex flex-wrap mt-4 gap-1">
              {#each $secondarySpecializations as muscleGroup}
                <button
                  class="badge badge-error font-semibold text-black flex gap-1"
                  on:click={() => removeMuscleGroup("secondary", muscleGroup)}
                >
                  {muscleGroup}
                  <CloseIcon />
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<button
  class="btn btn-accent btn-block mt-auto"
  disabled={callingEndpoint}
  on:click={submitMesocycle}
>
  {#if !callingEndpoint}
    {paramMap[params.mode].action} mesocycle
  {:else}
    {paramMap[params.mode].verb} mesocycle <span class="loading loading-spinner"></span>
  {/if}
</button>
