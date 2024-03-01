<script lang="ts">
  import ExerciseDrawer from "./ExerciseDrawer.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import { exerciseSplitStore } from "./splitStore";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  import ExerciseTemplateCard from "../ExerciseTemplateCard.svelte";
  export let currentTab;

  let selectedSplitDayIdx = 0;
  let exerciseSplit: ExerciseSplit = {
    exerciseSplitName: "",
    exerciseSplitDays: []
  };

  let editingExercise: (ExerciseTemplate & { idx: number }) | null = null;

  function addExercise(exerciseTemplate: ExerciseTemplate) {
    exerciseSplit.exerciseSplitDays[selectedSplitDayIdx]?.exerciseTemplates.push(exerciseTemplate);
    exerciseSplit = exerciseSplit;
    $exerciseSplitStore = exerciseSplit;
  }

  function openEditExercise(idx: number) {
    const currentSplitDay = exerciseSplit.exerciseSplitDays[
      selectedSplitDayIdx
    ] as ExerciseSplitDay;
    editingExercise = { ...currentSplitDay.exerciseTemplates[idx], idx };
  }

  onMount(() => {
    selectedSplitDayIdx = $exerciseSplitStore.exerciseSplitDays.findIndex(
      (splitDay) => splitDay !== null
    );
    exerciseSplit = $exerciseSplitStore;
  });
</script>

<Tabs.Root value={selectedSplitDayIdx.toString()} class="h-full flex flex-col">
  <Tabs.List class="flex bg-background p-0 overflow-x-auto justify-start">
    {#each exerciseSplit.exerciseSplitDays as splitDay, idx}
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
          {splitDay?.exerciseSplitDayName ?? "Rest"}
        </Button>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each exerciseSplit.exerciseSplitDays as splitDay, idx}
    {#if splitDay}
      <Tabs.Content value={idx.toString()}>
        <Card.Root class="h-full flex flex-col border-none">
          <Card.Header class="px-1 py-2">
            <Card.Title>{splitDay?.exerciseSplitDayName}</Card.Title>
            <Card.Description>Day {idx + 1}</Card.Description>
          </Card.Header>
          <Card.Content class="h-px grow overflow-y-auto py-2 flex flex-col gap-1 w-full px-0">
            {#each splitDay.exerciseTemplates as exerciseTemplate, idx}
              <ExerciseTemplateCard {idx} {exerciseTemplate} {openEditExercise} />
            {/each}
          </Card.Content>
          <Card.Footer class="flex flex-col gap-1.5 p-1 h-fit">
            <div class="grid grid-cols-3 w-full gap-1">
              <Button variant="outline">Cut</Button>
              <Button variant="outline">Copy</Button>
              <Button variant="outline">Paste</Button>
            </div>
          </Card.Footer>
        </Card.Root>
      </Tabs.Content>
    {/if}
  {/each}
  <div class="grid grid-cols-2 gap-1 px-1">
    <ExerciseDrawer bind:editingExercise {addExercise} />
    <Button>Next</Button>
  </div>
</Tabs.Root>
