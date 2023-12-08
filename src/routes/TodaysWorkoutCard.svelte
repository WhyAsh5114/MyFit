<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import MyModal from "$lib/components/MyModal.svelte";
  import {
    getMuscleGroups,
    getTodaysSplitWorkout,
    getTotalSets
  } from "$lib/util/MesocycleTemplate";
  import DoneIcon from "virtual:icons/material-symbols/done";
  export let activeMesocycle: ActiveMesocycle;
  export let activeMesocycleTemplate: MesocycleTemplate;

  let todaysWorkout: { name: string; exercises: SplitExercise[] } | null = null;
  $: if (activeMesocycle) {
    todaysWorkout = getTodaysSplitWorkout(
      activeMesocycle.workouts,
      activeMesocycleTemplate.exerciseSplit
    );
  }

  let totalSets = 0;
  let targetMuscleGroups: Set<MuscleGroup> = new Set();
  $: if (todaysWorkout) {
    totalSets = getTotalSets(todaysWorkout.exercises);
    targetMuscleGroups = getMuscleGroups(todaysWorkout.exercises);
  }

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";
  let callingEndpoint = false;
  async function completeRestDay() {
    if (todaysWorkout) {
      await goto("/workouts/new/exercises");
      return;
    }
    callingEndpoint = true;
    const response = await fetch("/api/workouts/completeRestDay", {
      method: "POST"
    });
    if (response.ok) {
      await invalidate("mesocycle:active");
      callingEndpoint = false;
      return;
    } else {
      modalTitle = "Error";
      modalText = await response.text();
      modal.show();
    }
  }
</script>

<MyModal bind:dialogElement={modal} bind:title={modalTitle}>
  {modalText}
</MyModal>
{#if todaysWorkout}
  <a class="btn btn-primary h-fit py-2 px-4" href="/workouts/new">
    <div class="flex flex-col gap-1 w-full font-normal">
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">{todaysWorkout?.name}</span>
        <span>{totalSets} sets</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each targetMuscleGroups as muscleGroup}
          {@const specialized = activeMesocycleTemplate.specialization?.includes(muscleGroup)}
          <span class="badge font-semibold {specialized ? 'badge-accent' : ''}">{muscleGroup}</span>
        {/each}
      </div>
    </div>
  </a>
{:else}
  <div class="flex flex-col p-2 bg-primary rounded-md font-semibold gap-2">
    It's a Rest day!
    <button class="btn btn-accent btn-sm" on:click={completeRestDay} disabled={callingEndpoint}>
      {#if callingEndpoint}
        <span class="loading loading-bars"></span>
      {:else}
        Mark complete <DoneIcon />
      {/if}
    </button>
  </div>
{/if}
