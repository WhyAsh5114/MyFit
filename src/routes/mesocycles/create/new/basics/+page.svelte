<script lang="ts">
  import MyModal from "$lib/components/MyModal.svelte";
  import { slide } from "svelte/transition";
  import {
    mesocycleName,
    mesocycleDuration,
    mesocycleStartRIR,
    mesocycleRIRProgression,
    customizeRIRProgression
  } from "../newMesocycleStore";
  import { goto } from "$app/navigation";
  import { getTotalDuration } from "$lib/util/MesocycleTemplate";

  let RIRColors = ["range-error", "range-warning", "range-accent", "range-success"];
  function calculateRIRProgression(totalDuration: number, startRIR: number) {
    let failureCycle = false;
    if (totalDuration > 0) {
      failureCycle = true;
      totalDuration -= 1;
    }
    let quotient = Math.floor(totalDuration / startRIR);
    let remainder = totalDuration % startRIR;
    quotient = isNaN(quotient) ? 0 : quotient;
    remainder = isNaN(remainder) ? 0 : remainder;

    let result = new Array(startRIR - remainder)
      .fill(quotient)
      .concat(new Array(remainder).fill(quotient + 1));

    let progression: RIRProgressionData[] = [];
    for (let i = startRIR; i >= 1; i--) {
      progression.push({ specificRIR: i, cycles: result[startRIR - i] });
    }
    progression.push({ specificRIR: 0, cycles: failureCycle ? 1 : 0 });
    return progression;
  }

  let RIRProgression: RIRProgressionData[];
  $: RIRProgression = calculateRIRProgression($mesocycleDuration, $mesocycleStartRIR);
  $: if (
    $mesocycleRIRProgression &&
    $mesocycleRIRProgression[0].specificRIR === $mesocycleStartRIR
  ) {
    RIRProgression = $mesocycleRIRProgression;
  }

  // Get number of cycles before 'x' RIR training begins
  function previousCycles(RIR: number) {
    let prevCycles = 0;
    RIRProgression.forEach((progression) => {
      if (RIR < progression.specificRIR) {
        prevCycles += progression.cycles;
      }
    });
    return prevCycles;
  }

  function modifyProgression(RIR: number, cycles: number) {
    // Set the current RIR's duration
    const p = RIRProgression.find(
      (progression) => progression.specificRIR === RIR
    ) as RIRProgressionData;
    p.cycles = cycles;

    // If no upcoming RIRs, function complete
    if (RIR === 0) {
      // Update DOM
      RIRProgression = RIRProgression;
      return;
    }

    // Modify the upcoming RIRs' progression
    let laterProgression = calculateRIRProgression(
      $mesocycleDuration - previousCycles(RIR) - cycles,
      RIR - 1
    );
    laterProgression.forEach(({ specificRIR, cycles }) => {
      const p = RIRProgression.find(
        (originalProgression) => originalProgression.specificRIR === specificRIR
      ) as RIRProgressionData;
      p.cycles = cycles;
    });

    // Update DOM
    RIRProgression = RIRProgression;
  }

  function isProgressionValid(progression: RIRProgressionData[], totalCycles: number) {
    let totalDuration = getTotalDuration(progression);
    return totalDuration === totalCycles;
  }

  let errorModal: HTMLDialogElement;
  async function validateProgression() {
    const isValid = isProgressionValid(RIRProgression, $mesocycleDuration);
    if (!isValid) {
      errorModal.show();
      return false;
    }
    $mesocycleRIRProgression = RIRProgression;
    await goto("/mesocycles/create/new/split");
  }
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  Total RIR duration is less than total mesocycle duration, re-adjust the sliders accordingly
</MyModal>
<form class="flex flex-col w-full grow" on:submit|preventDefault={validateProgression}>
  <div class="flex flex-col my-auto">
    <div class="form-control w-full max-w-xs mx-auto">
      <label class="label" for="mesocycle-name">
        <span class="label-text">Mesocycle name</span>
      </label>
      <input
        id="mesocycle-name"
        class="input input-bordered w-full"
        placeholder="Type here"
        required
        type="text"
        bind:value={$mesocycleName}
      />
    </div>
    <div class="form-control w-full mt-4 max-w-xs mx-auto">
      <label class="label" for="mesocycle-duration">
        <span class="label-text">Mesocycle duration</span>
        <span class="label-text-alt">{$mesocycleDuration} cycles</span>
      </label>
      <input
        id="mesocycle-duration"
        class="range range-secondary"
        max="20"
        min="4"
        type="range"
        bind:value={$mesocycleDuration}
      />
    </div>
    <div class="form-control w-full mt-4 max-w-xs mx-auto">
      <label class="label" for="mesocycle-start-RIR">
        <span class="label-text">Start RIR</span>
      </label>
      <select
        id="mesocycle-start-RIR"
        class="select select-bordered"
        bind:value={$mesocycleStartRIR}
      >
        <option value={3}>3 RIR</option>
        <option value={2}>2 RIR</option>
        <option value={1}>1 RIR</option>
        <option value={0}>0 RIR</option>
      </select>
    </div>
    <div class="form-control mt-4 max-w-xs mx-auto w-full">
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
      <div class="flex flex-col" transition:slide={{ duration: 200 }}>
        {#each RIRProgression as { specificRIR, cycles }, i}
          <div class="form-control w-full max-w-xs mx-auto">
            <label class="label pb-0.5" for={`${specificRIR}-RIR-duration`}>
              <span class="label-text">{specificRIR} RIR</span>
              <span class="label-text-alt">{cycles} cycles</span>
            </label>
            <input
              id={`${specificRIR}-RIR-duration`}
              class="range range-xs range-secondary {RIRColors[specificRIR]}"
              max={$mesocycleDuration - previousCycles(specificRIR)}
              min={i === 0 ? 1 : 0}
              type="range"
              value={cycles}
              on:input={(e) => modifyProgression(specificRIR, parseInt(e.currentTarget.value))}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div class="join grid grid-cols-2">
    <button class="btn btn-accent join-item" disabled>Previous</button>
    <button class="btn btn-accent join-item">Next</button>
  </div>
</form>
