<script lang="ts">
  import { caloricStates } from "$lib/types/arrays";
  import { range } from "$lib/utils/common";
  import { slide } from "svelte/transition";
  import {
    mesocycleName,
    mesocycleCaloricState,
    mesocycleStartRIR,
    mesocycleDuration,
    customizeRIRProgression
  } from "../mesocycleStore";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  $: ({ params } = $page);

  async function submitForm() {
    if (!$customizeRIRProgression) {
      // TODO: auto-fill RIR durations
    }
    await goto(`/mesocycles/${params.mode}/split`);
  }
</script>

<h2><span class="capitalize">{params.mode}</span> mesocycle</h2>
<h3>Basics</h3>

<form
  id="basicsForm"
  class="m-auto w-full max-w-sm flex flex-col gap-1"
  on:submit|preventDefault={submitForm}
>
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Mesocycle name</span>
    </div>
    <input
      id="mesocycle-name"
      class="input input-bordered w-full max-w-sm"
      placeholder="Type here"
      required
      type="text"
      bind:value={$mesocycleName}
    />
  </label>
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Caloric state</span>
    </div>
    <select
      id="mesocycle-caloric-state"
      class="select select-bordered"
      bind:value={$mesocycleCaloricState}
    >
      {#each caloricStates as { value, name, commonTerm }}
        <option {value}>{name} ({commonTerm})</option>
      {/each}
    </select>
  </label>
  <label class="form-control w-full">
    <div class="label">
      <span class="label-text">Start RIR</span>
    </div>
    <select id="mesocycle-start-RIR" class="select select-bordered" bind:value={$mesocycleStartRIR}>
      {#each range(4, -1, -1) as RIR}
        <option value={RIR}>{RIR} RIR</option>
      {/each}
    </select>
  </label>

  {#if !$customizeRIRProgression}
    <div class="form-control" transition:slide={{ duration: 200 }}>
      <div class="label">
        <label class="label-text" for="mesocycle-duration">Mesocycle duration</label>
        <span class="label-text-alt">{$mesocycleDuration} cycles</span>
      </div>
      <input
        id="mesocycle-duration"
        class="range range-sm"
        max={20}
        min={1}
        type="range"
        bind:value={$mesocycleDuration}
      />
    </div>
  {/if}

  <div class="form-control mt-2">
    <label class="label cursor-pointer">
      <span class="label-text">Customize RIR progression</span>
      <input
        id="customize-RIR-progression"
        class="toggle"
        type="checkbox"
        bind:checked={$customizeRIRProgression}
      />
    </label>
  </div>

  {#if $customizeRIRProgression}
    <div class="flex overflow-x-auto gap-1" transition:slide={{ duration: 200 }}>
      {#each range($mesocycleStartRIR, -1, -1) as specificRIR}
        <label class="form-control">
          <div class="label">
            <span class="label-text">{specificRIR} RIR</span>
          </div>
          <input
            id="{specificRIR}-RIR-cycles"
            class="input input-bordered w-20"
            min={1}
            placeholder="Cycles"
            required
            type="number"
          />
        </label>
      {/each}
    </div>
  {/if}
</form>

<button class="btn btn-accent" form="basicsForm" type="submit"> Select exercise split </button>
