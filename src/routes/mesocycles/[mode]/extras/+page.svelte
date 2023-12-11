<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { caloricStates, muscleGroups } from "$lib/types/arrays";
  import {
    exerciseSplit,
    mesocycleCaloricState,
    mesocycleName,
    mesocycleRIRProgression,
    mesocycleSpecialization,
    mesocycleStartRIR,
    resetStores,
    specializedMuscleGroups
  } from "../newMesocycleStore";
  import DeleteIcon from "virtual:icons/ph/x-bold";
  export let data;

  let remainingMuscleGroups = muscleGroups.slice();
  remainingMuscleGroups = remainingMuscleGroups.filter(
    (muscleGroup) => !$specializedMuscleGroups.includes(muscleGroup)
  );

  let selectedMuscleGroup: MuscleGroup | undefined,
    showSpecializedMuscleGroups = $specializedMuscleGroups.length !== 0;

  function specializeMuscleGroup() {
    if (!selectedMuscleGroup) {
      return;
    }

    $specializedMuscleGroups = [...$specializedMuscleGroups, selectedMuscleGroup];

    const idx = remainingMuscleGroups.indexOf(selectedMuscleGroup);
    remainingMuscleGroups.splice(idx, 1);
    remainingMuscleGroups = remainingMuscleGroups;

    selectedMuscleGroup = undefined;
    if ($specializedMuscleGroups.length === 1) {
      showSpecializedMuscleGroups = true;
    }
  }

  function removeSpecializedMuscleGroup(muscleGroup: MuscleGroup) {
    const idx = $specializedMuscleGroups.indexOf(muscleGroup);
    $specializedMuscleGroups.splice(idx, 1);
    $specializedMuscleGroups = $specializedMuscleGroups;

    remainingMuscleGroups = [...remainingMuscleGroups, muscleGroup];
    if ($specializedMuscleGroups.length === 0) {
      showSpecializedMuscleGroups = false;
    }
  }

  let callingEndpoint = false,
    errorMessage = "",
    errorModal: HTMLDialogElement,
    successModal: HTMLDialogElement,
    successText = "";
  async function submitForm() {
    if ($mesocycleSpecialization && $specializedMuscleGroups.length === 0) {
      errorMessage = "When specializing, add at least one muscle group to specialize";
      errorModal.show();
      return false;
    }
    const createdMesocycle: MesocycleTemplate = {
      name: $mesocycleName,
      startRIR: $mesocycleStartRIR,
      RIRProgression: $mesocycleRIRProgression,
      exerciseSplit: $exerciseSplit,
      caloricBalance: $mesocycleCaloricState,
      specialization: $mesocycleSpecialization ? $specializedMuscleGroups : undefined
    };

    let response: Response;
    if (!data.mesocycleTemplate) {
      const requestBody: APIMesocyclesCreateTemplate = {
        mesocycleTemplate: createdMesocycle
      };
      callingEndpoint = true;
      response = await fetch("/api/mesocycles/createTemplate", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "content-type": "application/json"
        }
      });
      callingEndpoint = false;
    } else {
      const requestBody: APIMesocyclesEditTemplate = {
        mesocycleTemplate: createdMesocycle,
        mesocycleTemplateId: data.mesocycleTemplate.id
      };
      callingEndpoint = true;
      response = await fetch("/api/mesocycles/editTemplate", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "content-type": "application/json"
        }
      });
      callingEndpoint = false;
    }
    if (!response.ok) {
      errorMessage = await response.text();
      errorModal.show();
      return;
    }
    successText = await response.text();
    successModal.show();
    resetStores();
  }

  let redirecting = false;
  async function closeMesocycleCreationSuccessfulModal() {
    redirecting = true;
    await invalidate("mesocycle:templates");
    await goto("/mesocycles");
    redirecting = false;
  }

  $: totalSpecializedMuscleGroups = $specializedMuscleGroups.length;
  $: ({ params } = $page);
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  {errorMessage}
</MyModal>

<MyModal
  onClose={closeMesocycleCreationSuccessfulModal}
  title="Success"
  bind:dialogElement={successModal}
>
  {successText}
</MyModal>

<div class="flex flex-col w-full max-w-sm m-auto gap-10">
  <form
    id="caloric-state-form"
    class="flex flex-col w-full gap-2"
    on:submit|preventDefault={submitForm}
  >
    <div class="form-control">
      <label class="label" for="mesocycle-caloric-state">
        <span class="label-text">Mesocycle caloric state</span>
      </label>
      <select
        id="mesocycle-caloric-state"
        class="select select-bordered"
        required
        bind:value={$mesocycleCaloricState}
      >
        {#each caloricStates as { name, commonTerm, value }}
          <option {value}>{name} ({commonTerm})</option>
        {/each}
      </select>
    </div>
  </form>

  <form id="specialization-form" class="w-full" on:submit|preventDefault>
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text">Specialization</span>
        <input
          id="enable-specialization"
          class="toggle"
          type="checkbox"
          bind:checked={$mesocycleSpecialization}
        />
      </label>
    </div>
    {#if $mesocycleSpecialization}
      <div class="form-control w-full">
        <div class="flex gap-1">
          <select
            id="specialize-muscle-group"
            class="select select-bordered grow"
            bind:value={selectedMuscleGroup}
          >
            <option disabled selected value={undefined}>Pick one</option>
            {#each remainingMuscleGroups as muscleGroup}
              <option value={muscleGroup}>{muscleGroup}</option>
            {/each}
          </select>
          <button class="btn btn-primary" on:click={specializeMuscleGroup}>Add</button>
        </div>
      </div>
      <div class="collapse bg-primary collapse-arrow rounded-md mt-2">
        <input
          id="show-specialized-muscle-groups"
          aria-label="show-specialized-muscle-groups"
          type="checkbox"
          bind:checked={showSpecializedMuscleGroups}
        />
        <div class="collapse-title text-lg font-medium">
          Specialized muscle groups: {totalSpecializedMuscleGroups}
        </div>
        <div class="collapse-content backdrop-brightness-75">
          <div class="flex flex-wrap gap-1.5 justify-center mt-3">
            {#each $specializedMuscleGroups as muscleGroup}
              <button
                class="badge gap-1 badge-accent font-semibold"
                on:click={() => {
                  removeSpecializedMuscleGroup(muscleGroup);
                }}
              >
                {muscleGroup}
                <DeleteIcon />
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>

<button
  class="btn btn-block btn-accent"
  disabled={callingEndpoint || redirecting}
  form="caloric-state-form"
  type="submit"
>
  {#if callingEndpoint}
    <span class="loading loading-bars" />
  {:else if redirecting}
    Redirecting
    <span class="loading loading-bars" />
  {:else if !data.mesocycleTemplate}
    Create mesocycle
  {:else if data.mesocycleTemplate}
    Edit mesocycle
  {/if}
</button>
