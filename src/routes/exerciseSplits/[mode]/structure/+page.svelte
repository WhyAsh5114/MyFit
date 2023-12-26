<script lang="ts">
  import AddIcon from "virtual:icons/material-symbols/add";
  import RemoveIcon from "virtual:icons/material-symbols/remove";
  import { exerciseSplit, splitName, splitStructure } from "../splitStore";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { goto } from "$app/navigation";
  $: ({ params } = $page);

  let atLeastOneWorkoutModal: HTMLDialogElement;
  let deleteSplitDataModal: HTMLDialogElement;

  function modifyStructure(operation: "add" | "remove") {
    if (operation === "add") {
      $splitStructure = [...$splitStructure, ""];
    } else {
      $splitStructure.pop();
      $splitStructure = $splitStructure;
    }
  }

  let notMatchedDays: Set<string> = new Set();

  async function submitStructure(force = false) {
    let nonRestDays = 0;
    $splitStructure.forEach((day) => {
      if (day !== null) nonRestDays++;
    });
    if (nonRestDays === 0) {
      atLeastOneWorkoutModal.show();
      return;
    }

    notMatchedDays.clear();
    $exerciseSplit.forEach((splitDay) => {
      if (splitDay) notMatchedDays.add(splitDay.name);
    });
    notMatchedDays = notMatchedDays;

    const newExerciseSplit: ExerciseSplit = [];
    $splitStructure.forEach((day) => {
      if (day === null) {
        newExerciseSplit.push(null);
      } else {
        const matchingDay = $exerciseSplit.find((splitDay) => splitDay?.name === day);
        if (matchingDay) {
          newExerciseSplit.push(matchingDay);
          notMatchedDays.delete(matchingDay.name);
        } else {
          newExerciseSplit.push({ name: day, exerciseTemplates: [] });
        }
      }
    });
    if (notMatchedDays.size > 0 && !force) {
      deleteSplitDataModal.show();
      return;
    }
    $exerciseSplit = newExerciseSplit;
    await goto(`/exerciseSplits/${$page.params.mode}/exercises`);
  }
</script>

<MyModal title="Error" bind:dialogElement={atLeastOneWorkoutModal}>
  <p>Add at least one workout to the exercise split</p>
</MyModal>

<MyModal title="Warning" bind:dialogElement={deleteSplitDataModal}>
  <p>
    You'll lose any exercise data created for the following workout days:
    <span class="font-semibold text-warning">{Array.from(notMatchedDays).join(", ")}</span>
  </p>
  <button class="btn btn-warning btn-block mt-4" on:click={() => submitStructure(true)}>
    Yes, continue
  </button>
</MyModal>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>
<h3>Structure</h3>

<form
  id="structure-form"
  class="m-auto w-full max-w-sm flex flex-col"
  on:submit|preventDefault={() => submitStructure()}
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
