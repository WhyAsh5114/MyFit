<script lang="ts">
  import ExerciseDrawer from "./ExerciseDrawer.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import { exerciseSplitStore } from "./splitStore";
  import { Button } from "$lib/components/ui/button";
  import ExerciseTemplateCard from "../ExerciseTemplateCard.svelte";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { cubicIn } from "svelte/easing";
  export let currentTab;

  type CustomExerciseSplitDay = {
    name: string;
    exerciseTemplates: (ExerciseTemplate & { isDndShadowItem?: boolean })[];
  };

  let selectedSplitDayIdx = 0;
  let exerciseSplit: ExerciseSplit = {
    name: "",
    splitDays: []
  };
  let editingExercise: (ExerciseTemplate & { idx: number }) | null = null;
  $: currentSplitDay = exerciseSplit.splitDays[
    selectedSplitDayIdx
  ] as CustomExerciseSplitDay | null;

  function addExercise(exerciseTemplate: ExerciseTemplate) {
    currentSplitDay?.exerciseTemplates.push(exerciseTemplate);
    exerciseSplit = exerciseSplit;
    $exerciseSplitStore = exerciseSplit;
  }

  function openEditExercise(idx: number) {
    if (currentSplitDay) editingExercise = { ...currentSplitDay.exerciseTemplates[idx], idx };
  }

  function handleSort(e: CustomEvent<DndEvent>) {
    if (!currentSplitDay) return;
    currentSplitDay.exerciseTemplates = e.detail.items as ExerciseTemplate[];
    exerciseSplit = exerciseSplit;
    $exerciseSplitStore = exerciseSplit;
  }

  $: {
    exerciseSplit = $exerciseSplitStore;
  }
</script>

<Tabs.Root value={selectedSplitDayIdx.toString()} class="h-full flex flex-col">
  <Tabs.List class="flex bg-background p-0 overflow-x-auto justify-start">
    {#each exerciseSplit.splitDays as splitDay, idx}
      <Tabs.Trigger
        disabled={splitDay === null}
        value={idx.toString()}
        on:click={() => {
          if (splitDay) selectedSplitDayIdx = idx;
        }}
        class="p-0"
      >
        <Button
          variant={idx === selectedSplitDayIdx ? "outline" : "ghost"}
          class="hover:bg-background border {idx === selectedSplitDayIdx
            ? ''
            : 'border-background'}"
        >
          {splitDay?.name ?? "Rest"}
        </Button>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#if currentSplitDay}
    <Tabs.Content value={selectedSplitDayIdx.toString()}>
      <Card.Root class="h-full flex flex-col border-none">
        <Card.Header class="px-1 py-2">
          <Card.Title>{currentSplitDay.name}</Card.Title>
          <Card.Description>Day {selectedSplitDayIdx + 1}</Card.Description>
        </Card.Header>
        <Card.Content class="py-2 h-full w-full px-0">
          <div
            use:dndzone={{
              items: currentSplitDay.exerciseTemplates,
              flipDurationMs: 200,
              dropTargetClasses: ["border-none"],
              dropTargetStyle: {}
            }}
            on:consider={handleSort}
            on:finalize={handleSort}
            class="flex flex-col gap-1"
          >
            {#each currentSplitDay.exerciseTemplates as exerciseTemplate, idx (exerciseTemplate.name)}
              <div class="relative" animate:flip={{ duration: 200 }}>
                <ExerciseTemplateCard {idx} {exerciseTemplate} {openEditExercise} />
                {#if exerciseTemplate[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                  <div in:fade={{ duration: 200, easing: cubicIn }} class="custom-shadow-item" />
                {/if}
              </div>
            {/each}
          </div>
        </Card.Content>
        <Card.Footer class="flex flex-col gap-1.5 py-1 px-0 h-fit">
          <div class="grid grid-cols-3 w-full gap-1">
            <Button variant="secondary">Cut</Button>
            <Button variant="secondary">Copy</Button>
            <Button variant="secondary">Paste</Button>
          </div>
        </Card.Footer>
      </Card.Root>
    </Tabs.Content>
  {/if}
  <div class="grid grid-cols-2 gap-1">
    <ExerciseDrawer bind:editingExercise {addExercise} />
    <Button on:click={() => (currentTab = "overview")}>Next</Button>
  </div>
</Tabs.Root>

<style>
  .custom-shadow-item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    opacity: 0.5;
    margin: 0;
    box-sizing: border-box;
    @apply bg-secondary rounded-md;
  }
</style>
