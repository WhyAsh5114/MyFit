<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import { dateFormatter } from "$lib/util/CommonFunctions.js";
  import VolumeGraph from "./VolumeGraph.svelte";
  import InsightsIcon from "virtual:icons/ic/baseline-insights";
  export let data;

  let callingEndpoint = false,
    modal: HTMLDialogElement,
    modalText = "",
    modalTitle = "",
    stopConfirmationModal: HTMLDialogElement;
  async function stopMesocycle() {
    const requestBody: APIMesocyclesStopMesocycle = {
      activeMesocycleId: data.mesocycle.id
    };
    callingEndpoint = true;
    const response = await fetch("/api/mesocycles/stopMesocycle", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    callingEndpoint = false;
    stopConfirmationModal.close();
    modalText = await response.text();
    if (response.ok) {
      modalTitle = "Success";
    } else {
      modalTitle = "Error";
    }
    modal.show();
  }

  let redirecting = false;
  async function closeMesocycleStoppedModal() {
    redirecting = true;
    await invalidate("mesocycle:active");
    await goto("/mesocycles");
    redirecting = false;
  }
</script>

<MyModal onClose={closeMesocycleStoppedModal} bind:dialogElement={modal} bind:title={modalTitle}>
  {modalText}
</MyModal>

<MyModal
  title="Stop mesocycle"
  titleColor="text-warning"
  bind:dialogElement={stopConfirmationModal}
>
  Are you sure you want to stop this mesocycle?
  <div class="join grid grid-cols-2 mt-5">
    <button class="join-item btn">Cancel</button>
    <button
      class="join-item btn btn-warning"
      disabled={callingEndpoint}
      type="button"
      on:click={stopMesocycle}
    >
      {#if callingEndpoint}
        <span class="loading loading-bars" />
      {:else}
        Yes, stop
      {/if}
    </button>
  </div>
</MyModal>

<div class="stats stats-vertical grid grid-cols-2">
  <div class="stat col-span-2">
    <div class="stat-title">Mesocycle template</div>
    <a
      class="stat-value link truncate"
      href="/mesocycles/viewTemplate/{data.mesocycleTemplate?.id}"
    >
      {data.mesocycleTemplate?.name}
    </a>
  </div>
  <div class="stat">
    <div class="stat-title">Started at</div>
    <div class="stat-value">{dateFormatter(data.mesocycle.startTimestamp)}</div>
  </div>
  <div class="stat">
    <div class="stat-title">Ended at</div>
    {#if data.mesocycle.endTimestamp !== undefined}
      <div class="stat-value">{dateFormatter(data.mesocycle.endTimestamp)}</div>
    {:else}
      <div class="stat-value">Active</div>
    {/if}
  </div>
  <div class="stat col-span-2">
    <div class="stat-title">Workouts</div>
    <div class="flex flex-col max-h-32 overflow-y-auto mt-2 gap-1 drop-shadow-md shadow-black">
      {#if data.streamed.workoutsStreamArray.length > 0}
        {#each data.streamed.workoutsStreamArray as workoutPromise}
          {#await workoutPromise}
            <div class="skeleton h-8 w-full bg-primary brightness-50 rounded-md" />
          {:then workout}
            {#if workout}
              <a class="btn h-8 btn-sm" href="/workouts/{workout.id}/view">
                <div class="flex w-full justify-between items-center">
                  <span>{dateFormatter(workout.startTimestamp)}</span>
                  <span class="font-normal text-sm">
                    {data.mesocycleTemplate?.exerciseSplit[workout.dayNumber]?.name}, Cycle {workout.cycleNumber}
                  </span>
                </div>
              </a>
            {/if}
          {/await}
        {/each}
      {:else}
        <div class="btn btn-sm btn-block text-error">No workouts found</div>
      {/if}
    </div>
  </div>
  {#if data.mesocycle.workouts.length > 0 && data.mesocycleTemplate}
    <div class="stat col-span-2">
      <div class="stat-title mb-2">Volume progression</div>
      {#await Promise.all(data.streamed.workoutsStreamArray)}
        <div class="skeleton h-56 w-full bg-primary brightness-50 rounded-md" />
      {:then workouts}
        <VolumeGraph {workouts} />
        <a class="btn mt-2 text-accent gap-4" href="/mesocycles/view/${data.mesocycle.id}/insights">
          <InsightsIcon class="h-6 w-6" />
          More insights
        </a>
      {/await}
    </div>
  {/if}
</div>

{#if !data.mesocycle.endTimestamp}
  <button
    class="btn btn-block btn-warning mt-auto"
    disabled={redirecting}
    on:click={() => {
      stopConfirmationModal.show();
    }}
  >
    {#if redirecting}
      Redirecting
      <span class="loading loading-bars" />
    {:else}
      Stop mesocycle
    {/if}
  </button>
{/if}
