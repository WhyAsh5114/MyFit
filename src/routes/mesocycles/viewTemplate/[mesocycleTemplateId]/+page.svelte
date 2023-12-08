<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { caloricStates } from "$lib/types/arrays.js";
  import { dateFormatter } from "$lib/util/CommonFunctions.js";
  import { getTotalDuration } from "$lib/util/MesocycleTemplate.js";
  export let data;

  const caloricState = caloricStates.find(
    (state) => state.value === data.mesocycleTemplate.caloricBalance
  );

  let callingEndpoint = false,
    deleteModal: HTMLDialogElement,
    deletionSuccessfulModal: HTMLDialogElement,
    errorModal: HTMLDialogElement,
    errorMsg = "";

  async function deleteMesocycle() {
    const requestBody: APIMesocyclesDeleteTemplate = {
      mesocycleTemplateId: $page.params.mesocycleTemplateId
    };
    callingEndpoint = true;
    const response = await fetch("/api/mesocycles/deleteTemplate", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    callingEndpoint = false;
    deleteModal.close();
    if (response.ok) {
      deletionSuccessfulModal.show();
      return;
    }
    errorMsg = await response.text();
    errorModal.show();
  }

  let startSuccessfulModal: HTMLDialogElement;
  async function startMesocycle() {
    const requestBody: APIMesocyclesStartMesocycle = {
      mesocycleTemplateId: $page.params.mesocycleTemplateId
    };
    callingEndpoint = true;
    const response = await fetch("/api/mesocycles/startMesocycle", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "content-type": "application/json"
      }
    });
    await invalidate("mesocycle:active");
    callingEndpoint = false;
    if (response.ok) {
      startSuccessfulModal.show();
      return;
    }
    errorMsg = await response.text();
    errorModal.show();
  }

  let redirecting = false;
  async function closeMesocycleDeleteModal() {
    redirecting = true;
    await invalidate("mesocycle:templates");
    await goto("/mesocycles");
    redirecting = false;
  }

  const RIRColors = ["progress-error", "progress-warning", "progress-accent", "progress-success"];
</script>

<MyModal title="Error" bind:dialogElement={errorModal}>
  {errorMsg}
</MyModal>

<MyModal title="Delete mesocycle" bind:dialogElement={deleteModal}>
  Are you sure you want to delete this mesocycle? <b>({data.mesocycleTemplate.name})</b>
  <div class="join grid grid-cols-2 mt-4">
    <button class="join-item btn"> Cancel </button>
    <button
      class="join-item btn btn-error"
      disabled={callingEndpoint}
      type="button"
      on:click={deleteMesocycle}
    >
      {#if callingEndpoint}
        <span class="loading loading-bars" />
      {:else}
        Yes, delete
      {/if}
    </button>
  </div>
</MyModal>
<MyModal
  onClose={closeMesocycleDeleteModal}
  title="Deleted successfully"
  bind:dialogElement={deletionSuccessfulModal}
>
  Mesocycle <span class="font-semibold">{data.mesocycleTemplate.name}</span> deleted successfully
</MyModal>

<MyModal title="Started successfully" bind:dialogElement={startSuccessfulModal}>
  Mesocycle started successfully
</MyModal>

<div class="stats stats-vertical grid-cols-2 overflow-y-auto mb-2">
  <div class="stat col-span-2">
    <div class="stat-title">Mesocycle name</div>
    <div class="stat-value">{data.mesocycleTemplate.name}</div>
  </div>

  <div class="stat">
    <div class="stat-title">Start RIR</div>
    <div class="stat-value">{data.mesocycleTemplate.startRIR} RIR</div>
  </div>
  <div class="stat">
    <div class="stat-title">Total duration</div>
    <div class="stat-value">
      {getTotalDuration(data.mesocycleTemplate.RIRProgression)} cycles
    </div>
  </div>

  <div class="stat col-span-2">
    <div class="stat-title">RIR progression</div>
    <div class="flex flex-col mt-1.5 mb-1">
      {#each data.mesocycleTemplate.RIRProgression as { specificRIR, cycles }}
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm text-white font-semibold basis-9 shrink-0">{specificRIR} RIR</span>
          <progress
            class="progress {RIRColors[specificRIR]}"
            max={getTotalDuration(data.mesocycleTemplate.RIRProgression)}
            value={cycles}
          />
          <span class="text-sm text-white text-right basis-14 shrink-0">{cycles} cycles</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="stat col-span-2">
    <div class="stat-title">Caloric state</div>
    <div class="stat-value">{caloricState?.name} ({caloricState?.commonTerm})</div>
  </div>

  <div class="stat col-span-2">
    <div class="stat-title">Exercise split</div>
    <div class="flex flex-wrap gap-2 mt-1.5">
      {#each data.mesocycleTemplate.exerciseSplit as split, i}
        <div class="join font-semibold text-sm">
          <span class="join-item bg-base-200 px-2">D{i + 1}</span>
          {#if split}
            <span class="join-item bg-secondary text-black px-2">{split.name}</span>
          {:else}
            <span class="join-item bg-base-200 px-2">Rest</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if data.mesocycleTemplate.specialization}
    <div class="stat col-span-2">
      <div class="stat-title">Specialization</div>
      <div class="flex flex-wrap gap-1 mt-1.5">
        {#each data.mesocycleTemplate.specialization as muscleGroup}
          <span class="badge badge-accent font-semibold">{muscleGroup}</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if data.streamed.mesocyclesStreamArray.length > 0}
    <div class="stat col-span-2">
      <div class="stat-title">Usages</div>
      <div class="flex flex-col mt-2 max-h-32 overflow-y-auto gap-1">
        {#each data.streamed.mesocyclesStreamArray as mesocyclePromise}
          {#await mesocyclePromise then mesocycle}
            {#if mesocycle}
              {#if mesocycle.endTimestamp === undefined}
                <a
                  class="btn btn-sm text-accent"
                  href="/mesocycles/view/{data.activeMesocycle?.id}"
                >
                  {dateFormatter(mesocycle.startTimestamp)}
                </a>
              {:else}
                <a class="btn btn-sm" href="/mesocycles/view/{mesocycle.id}">
                  {dateFormatter(mesocycle.startTimestamp)}
                </a>
              {/if}
            {/if}
          {/await}
        {/each}
      </div>
    </div>
  {/if}
</div>
<div class="join grid grid-cols-2 mt-auto">
  <button
    class="join-item btn btn-error"
    on:click={() => {
      deleteModal.show();
    }}
  >
    {#if redirecting}
      Redirecting
      <span class="loading loading-bars" />
    {:else}
      Delete
    {/if}
  </button>
  <button class="join-item btn btn-primary" disabled={callingEndpoint} on:click={startMesocycle}>
    {#if callingEndpoint}
      <span class="loading loading-bars" />
    {:else}
      Start
    {/if}
  </button>
</div>
