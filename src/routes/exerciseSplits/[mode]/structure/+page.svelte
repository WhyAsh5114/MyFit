<script lang="ts">
  import AddIcon from "virtual:icons/material-symbols/add";
  import RemoveIcon from "virtual:icons/material-symbols/remove";
  import { exerciseSplits, splitName, splitStructure } from "../splitStore";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { goto } from "$app/navigation";
  $: ({ params } = $page);

  let modal: HTMLDialogElement;
  let modalTitle = "";
  let modalText = "";

  function modifyStructure(operation: "add" | "remove") {
    if (operation === "add") {
      $splitStructure = [...$splitStructure, ""];
    } else {
      $splitStructure.pop();
      $splitStructure = $splitStructure;
    }
  }

  async function submitStructure() {
    let nonRestDays = 0;
    $splitStructure.forEach((day) => {
      if (day !== null) nonRestDays++;
    });
    if (nonRestDays === 0) {
      modalTitle = "Error";
      modalText = "Add at least one workout to the exercise split";
      modal.show();
      return;
    }
    $exerciseSplits = [];
    $splitStructure.forEach((day) => {
      if (day === null) {
        $exerciseSplits.push(null);
      } else {
        $exerciseSplits.push({ name: day, exerciseTemplates: [] });
      }
    });
    $exerciseSplits = $exerciseSplits;
    await goto(`/exerciseSplits/${$page.params.mode}/exercises`);
  }
</script>

<MyModal title={modalTitle} bind:dialogElement={modal}>
  {modalText}
</MyModal>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>Structure</h3>

<form
  id="structure-form"
  class="m-auto w-full max-w-sm flex flex-col"
  on:submit|preventDefault={submitStructure}
>
  <label class="form-control w-full mb-8">
    <div class="label">
      <span class="label-text">Exercise split name</span>
    </div>
    <input
      id="exercise-split-name"
      class="input input-bordered w-full max-w-sm"
      placeholder="Type here"
      required
      type="text"
      bind:value={$splitName}
    />
  </label>
  <div class="flex text-sm mb-2">
    <span class="grow text-center">Workout name</span>
    <span>Rest</span>
  </div>
  <div class="flex flex-col h-64 gap-1 overflow-y-auto">
    {#each $splitStructure as day, i}
      <div class="flex items-center gap-4 justify-around">
        <div class="join grow">
          <span
            class="join-item bg-primary basis-16 shrink-0 flex items-center justify-center font-semibold text-sm"
          >
            Day {i + 1}
          </span>
          <input
            id="day{i + 1}-workout-name"
            class="join-item input input-sm input-bordered w-full"
            disabled={day === null}
            placeholder={day === null ? "Rest" : ""}
            required
            type="text"
            bind:value={day}
          />
        </div>
        <input
          id="mark-day{i + 1}-as-rest"
          class="checkbox"
          checked={day === null}
          type="checkbox"
          on:change={({ currentTarget }) => {
            day = currentTarget.checked ? null : "";
          }}
        />
      </div>
    {/each}
  </div>
  <div class="join grid grid-cols-2 w-full gap-1 mt-2">
    <button
      class="join-item btn btn-sm btn-primary"
      type="button"
      on:click={() => modifyStructure("remove")}
    >
      <RemoveIcon />
    </button>
    <button
      class="join-item btn btn-sm btn-primary"
      type="button"
      on:click={() => modifyStructure("add")}
    >
      <AddIcon />
    </button>
  </div>
</form>
<button class="btn btn-block btn-accent" form="structure-form" type="submit">
  Select exercises
</button>
