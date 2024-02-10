<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import { caloricStates } from "$lib/types/arrays.js";
  import { dateFormatter } from "$lib/utils/common";
  import PlayIcon from "virtual:icons/mdi/play";

  export let data;
  $: ({ mesocycle, exerciseSplit } = data);

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";
  let modalOnClose = () => {};

  const caloricState = caloricStates.find((state) => state.value === data.mesocycle.caloricBalance);
  let callingEndpoint = false;

  async function deleteMesocycle() {
    callingEndpoint = true;
    const response = await fetch(`/api/mesocycles/${mesocycle._id}`, { method: "DELETE" });
    modalTitle = response.ok ? "Success" : "Error";
    modalText = await response.text();
    if (response.ok) {
      modalOnClose = async () => {
        await invalidate(`/api/mesocycles/${mesocycle._id}`);
        await goto("/mesocycles");
      };
    }
    callingEndpoint = false;
    modal.show();
  }
</script>

<MyModal {modalOnClose} title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<div class="stats stats-vertical grid-cols-2">
  <div class="stat col-span-2">
    <div class="stat-title">Mesocycle name</div>
    <div class="stat-value">{mesocycle.name}</div>
    <div class="stat-desc">
      {caloricState?.name} ({caloricState?.commonTerm})
    </div>
  </div>
  <div class="stat">
    <div class="stat-title">Duration</div>
    {#if !mesocycle.startTimestamp}
      <div class="flex gap-2 items-center">
        <div class="stat-value">Not used</div>
        <button class="btn btn-xs btn-outline btn-circle"><PlayIcon /></button>
      </div>
    {:else if !mesocycle.endTimestamp}
      <div class="stat-value text-accent">{dateFormatter(mesocycle.startTimestamp)}</div>
    {:else}
      <div class="stat-value">
        {dateFormatter(mesocycle.startTimestamp)} to {dateFormatter(mesocycle.endTimestamp)}
      </div>
    {/if}
  </div>
  <div class="stat">
    <div class="stat-title">Exercise split</div>
    <a class="stat-value link truncate" href="/exerciseSplits/view/{exerciseSplit._id}"
      >{exerciseSplit.name}</a
    >
  </div>
  <div class="stat col-span-2">
    <div class="stat-title">RIR progression</div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each mesocycle.RIRProgression.toReversed() as progression}
        <div class="join text-sm">
          <span class="join-item bg-neutral px-2 py-1 font-semibold"
            >{progression.specificRIR} RIR</span
          >
          <span class="join-item bg-secondary text-black px-2 py-1"
            >{progression.cycles} cycles</span
          >
        </div>
      {/each}
    </div>
  </div>
  {#if mesocycle.specializations !== null}
    <div class="stat col-span-2">
      <div class="stat-title">Specializations</div>
      <div class="flex flex-wrap">
        {#each mesocycle.specializations as specialization}
          <span
            class="badge"
            class:badge-accent={specialization.type === "primary"}
            class:badge-secondary={specialization.type === "secondary"}
          >
            {specialization.muscleGroup}
          </span>
        {/each}
      </div>
    </div>
  {/if}
  <!-- TODO: workouts -->
</div>

<div class="join mt-auto grid grid-cols-2">
  <button class="join-item btn btn-error" disabled={callingEndpoint} on:click={deleteMesocycle}>
    {#if !callingEndpoint}
      Delete
    {:else}
      Deleting <span class="loading loading-spinner"></span>
    {/if}
  </button>
  <a class="join-item btn btn-primary" href="/mesocycles/edit?editId={mesocycle._id}">Edit</a>
</div>
