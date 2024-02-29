<script lang="ts">
  import ExerciseDrawer from "./ExerciseDrawer.svelte";

  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import { exerciseSplitStore } from "./splitStore";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  export let currentTab;

  let selectedSplitDayIdx = 0;
  let exerciseSplit: ExerciseSplit = {
    exerciseSplitName: "",
    exerciseSplitDays: []
  };

  onMount(() => {
    selectedSplitDayIdx = $exerciseSplitStore.exerciseSplitDays.findIndex(
      (splitDay) => splitDay !== null
    );
    exerciseSplit = $exerciseSplitStore;
  });
</script>

<Tabs.Root value={selectedSplitDayIdx.toString()} class="grow flex flex-col">
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
    <Tabs.Content value={idx.toString()}>
      <Card.Root class="grow flex flex-col border-none">
        <Card.Header class="px-1 py-2">
          <Card.Title>{splitDay?.exerciseSplitDayName}</Card.Title>
          <Card.Description>Day {idx + 1}</Card.Description>
        </Card.Header>
        <Card.Content class="h-full px-1 py-2"></Card.Content>
        <Card.Footer class="flex flex-col gap-1.5 px-1 py-2 h-fit">
          <div class="grid grid-cols-3 w-full gap-1">
            <Button variant="outline">Cut</Button>
            <Button variant="outline">Copy</Button>
            <Button variant="outline">Paste</Button>
          </div>
          <ExerciseDrawer />
        </Card.Footer>
      </Card.Root>
    </Tabs.Content>
  {/each}
</Tabs.Root>
