<script lang="ts">
  import ViewSplitExercises from "./ViewSplitExercises.svelte";
  import ViewSplitStats from "./ViewSplitStats.svelte";

  export let data;
  $: ({ exerciseSplit } = data);

  let currentSection: "Stats" | "Exercises" = "Stats";
</script>

<h2>View split</h2>

<div class="join w-full grid grid-cols-2 mb-2">
  <input
    name="view"
    class="join-item btn btn-primary checked:!bg-accent checked:!text-black"
    aria-label="Stats"
    checked
    type="radio"
    value="Stats"
    bind:group={currentSection}
  />
  <input
    name="view"
    class="join-item btn btn-primary checked:!bg-accent checked:!text-black"
    aria-label="Exercises"
    type="radio"
    value="Exercises"
    bind:group={currentSection}
  />
</div>

{#if currentSection === "Stats"}
  <ViewSplitStats {exerciseSplit} />
{:else}
  <ViewSplitExercises {exerciseSplit} />
{/if}

<div class="join grid grid-cols-2 mt-auto">
  <button class="join-item btn btn-error">Delete</button>
  <button class="join-item btn btn-primary">Edit</button>
</div>
