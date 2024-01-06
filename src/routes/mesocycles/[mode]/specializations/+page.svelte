<script lang="ts">
  import AddIcon from "virtual:icons/material-symbols/add";
  import CloseIcon from "virtual:icons/material-symbols/close";
  import { page } from "$app/stores";
  import { slide } from "svelte/transition";
  import {
    primarySpecializations,
    secondarySpecializations,
    useSpecializations,
    remainingMuscleGroups
  } from "../mesocycleStore";
  $: ({ params } = $page);

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

  async function createOrEditMesocycle() {
    // TODO: add/edit
    // check for at least one specialization in either primary or secondary
  }
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
<h3>Specializations</h3>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Use specialization</span>
    <input
      id="use-specializtion"
      class="toggle"
      type="checkbox"
      bind:checked={$useSpecializations}
    />
  </label>
</div>

{#if $useSpecializations}
  <div class="flex flex-col gap-1 max-w-sm m-auto w-full">
    <div transition:slide>
      <label class="form-control w-full max-w-sm mx-auto">
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
      <div class="join grid grid-cols-2 gap-1 mt-2 rounded-md max-w-sm mx-auto w-full">
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
    <div class="flex flex-col gap-1" transition:slide>
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

<button class="btn btn-accent btn-block mt-auto" on:click={createOrEditMesocycle}>
  {#if params.mode === "new"}
    Create mesocycle
  {:else}
    Edit mesocycle
  {/if}
</button>
