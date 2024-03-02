<script lang="ts">
  import ExerciseDrawer from "./ExerciseDrawer.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import { exerciseSplitStore } from "./splitStore";
  import { Button } from "$lib/components/ui/button";
  import ExerciseTemplateCard from "../ExerciseTemplateCard.svelte";
  import { dndzone, type DndEvent, SOURCES } from "svelte-dnd-action";
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { cn } from "$lib/utils";
  import { toast } from "svelte-sonner";
  export let currentTab;

  type CustomExerciseSplitDay = {
    name: string;
    exerciseTemplates: (ExerciseTemplate & { isDndShadowItem?: boolean })[];
  };

  let dragDisabled = true;
  let editingExercise: (ExerciseTemplate & { idx: number }) | null = null;
  let copiedExercises: ExerciseTemplate[] = [];

  let selectedSplitDayIdx = $exerciseSplitStore.splitDays.findIndex((split) => split !== null);
  let selectedSplitDay: CustomExerciseSplitDay | null;
  $: updateSelectedWorkout(selectedSplitDayIdx);
  $: $exerciseSplitStore.splitDays[selectedSplitDayIdx] = selectedSplitDay;

  function updateSelectedWorkout(selectedSplitDayIdx: number) {
    selectedSplitDay = $exerciseSplitStore.splitDays[selectedSplitDayIdx];
  }

  function addExercise(exerciseTemplate: ExerciseTemplate) {
    if (!selectedSplitDay) return false;
    if (
      selectedSplitDay.exerciseTemplates.find((exercise) => {
        return exercise.name === exerciseTemplate.name;
      })
    ) {
      return false;
    }
    selectedSplitDay.exerciseTemplates = [...selectedSplitDay.exerciseTemplates, exerciseTemplate];
    return true;
  }

  function openEditExercise(idx: number) {
    if (!selectedSplitDay) return;
    editingExercise = { ...selectedSplitDay.exerciseTemplates[idx], idx };
  }

  function editExercise(exerciseTemplate: ExerciseTemplate & { idx: number }) {
    if (!selectedSplitDay) return false;
    if (
      selectedSplitDay.exerciseTemplates.find((_exerciseTemplate, _idx) => {
        return _exerciseTemplate.name === exerciseTemplate.name && _idx !== _idx;
      })
    ) {
      return false;
    }
    selectedSplitDay.exerciseTemplates = selectedSplitDay.exerciseTemplates.map(
      (_exerciseTemplate, _idx) => {
        if (_idx === exerciseTemplate.idx) {
          const exerciseTemplateToSet = exerciseTemplate as ExerciseTemplate & { idx?: number };
          delete exerciseTemplateToSet.idx;
          return exerciseTemplateToSet;
        } else {
          return _exerciseTemplate;
        }
      }
    );
    return true;
  }

  function deleteExercise(idx: number) {
    if (!selectedSplitDay) return;
    selectedSplitDay.exerciseTemplates = selectedSplitDay.exerciseTemplates.filter(
      (_, _idx) => _idx !== idx
    );
  }

  function copyExercises() {
    if (!selectedSplitDay) return;
    copiedExercises = JSON.parse(
      JSON.stringify(selectedSplitDay.exerciseTemplates)
    ) as ExerciseTemplate[];
  }

  function pasteExercises() {
    if (!selectedSplitDay) return;
    selectedSplitDay.exerciseTemplates = JSON.parse(
      JSON.stringify(copiedExercises)
    ) as ExerciseTemplate[];
  }

  function cutExercises() {
    if (!selectedSplitDay) return;
    copyExercises();
    selectedSplitDay.exerciseTemplates = [];
  }

  function handleConsider(e: CustomEvent<DndEvent<ExerciseTemplate>>) {
    if (!selectedSplitDay) return;
    const {
      items: newItems,
      info: { source, trigger }
    } = e.detail;
    selectedSplitDay.exerciseTemplates = newItems;
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) dragDisabled = true;
  }

  function handleFinalize(e: CustomEvent<DndEvent<ExerciseTemplate>>) {
    if (!selectedSplitDay) return;
    const {
      items: newItems,
      info: { source }
    } = e.detail;
    selectedSplitDay.exerciseTemplates = newItems;
    if (source === SOURCES.POINTER) dragDisabled = true;
  }

  function startDrag(e: DragEvent) {
    dragDisabled = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && dragDisabled) dragDisabled = false;
  }

  function submitExercises() {
    const emptyWorkouts = $exerciseSplitStore.splitDays
      .filter((splitDay) => splitDay?.exerciseTemplates.length === 0)
      .map((splitDay) => splitDay?.name);
    if (emptyWorkouts.length > 0) {
      toast.error("Error", {
        description: "Add at least one exercise to workouts: " + emptyWorkouts.join(", ")
      });
      return;
    }
    currentTab = "overview";
  }
</script>

<Tabs.Root value={selectedSplitDayIdx.toString()} class="h-full flex flex-col">
  <Tabs.List class="flex bg-background p-0 overflow-x-auto justify-start">
    {#each $exerciseSplitStore.splitDays as splitDay, idx}
      <Tabs.Trigger value={idx.toString()} on:click={() => (selectedSplitDayIdx = idx)} class="p-0">
        <Button
          variant={idx === selectedSplitDayIdx ? "outline" : "ghost"}
          class={cn("hover:bg-background border border-background", {
            "border-border": idx === selectedSplitDayIdx,
            italic: splitDay === null
          })}
        >
          {splitDay?.name ?? "Rest"}
        </Button>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#key selectedSplitDayIdx}
    <Tabs.Content value={selectedSplitDayIdx.toString()}>
      <Card.Root class="h-full flex flex-col border-none">
        <Card.Header class="px-1 py-2">
          <Card.Title class={cn({ "text-muted-foreground": selectedSplitDay === null })}>
            {selectedSplitDay?.name ?? "Rest day"}
          </Card.Title>
          <Card.Description>Day {selectedSplitDayIdx + 1}</Card.Description>
        </Card.Header>
        <Card.Content class="py-2 h-full w-full px-0 flex flex-col">
          {#if selectedSplitDay}
            <div
              use:dndzone={{
                items: selectedSplitDay.exerciseTemplates,
                flipDurationMs: 200,
                dropTargetClasses: ["border-none"],
                dropTargetStyle: {},
                dragDisabled
              }}
              on:consider={handleConsider}
              on:finalize={handleFinalize}
              class="flex flex-col gap-1 h-px grow overflow-y-auto"
            >
              {#each selectedSplitDay.exerciseTemplates as exerciseTemplate, idx (exerciseTemplate.name)}
                <div class="relative" animate:flip={{ duration: 200 }}>
                  <ExerciseTemplateCard
                    {idx}
                    {exerciseTemplate}
                    {startDrag}
                    {handleKeyDown}
                    {openEditExercise}
                    {deleteExercise}
                  />
                  {#if exerciseTemplate[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                    <div in:fade={{ duration: 200 }} class="custom-shadow-item" />
                  {/if}
                </div>
              {:else}
                <div class="flex flex-col p-2 border rounded-md text-sm text-muted-foreground">
                  No exercises added
                </div>
              {/each}
            </div>
          {:else}
            <div class="flex flex-col p-2 border rounded-md text-sm text-muted-foreground">
              Rest and relax
            </div>
          {/if}
        </Card.Content>
        <Card.Footer class="flex flex-col gap-1.5 py-1 px-0 h-fit">
          <div class="grid grid-cols-3 w-full gap-1">
            <Button variant="secondary" disabled={selectedSplitDay === null} on:click={cutExercises}
              >Cut</Button
            >
            <Button
              variant="secondary"
              disabled={selectedSplitDay === null}
              on:click={copyExercises}>Copy</Button
            >
            <Button
              variant="secondary"
              disabled={selectedSplitDay === null}
              on:click={pasteExercises}>Paste</Button
            >
          </div>
        </Card.Footer>
      </Card.Root>
    </Tabs.Content>
  {/key}
  <div class="grid grid-cols-2 gap-1">
    <ExerciseDrawer
      onRestDay={selectedSplitDay === null}
      bind:editingExercise
      {addExercise}
      {editExercise}
    />
    <Button on:click={submitExercises}>Next</Button>
  </div>
</Tabs.Root>

<style lang="postcss">
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
